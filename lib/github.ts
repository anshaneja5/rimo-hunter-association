import { graphql } from '@octokit/graphql';
import type { RawActivityEvent, MemberProfile } from './types';

export interface RepoSummary {
  name: string;
  isArchived: boolean;
}

interface GhClient {
  fetchOrgMembers(org: string): Promise<MemberProfile[]>;
  fetchOrgRepos(org: string): Promise<RepoSummary[]>;
  fetchRepoActivity(org: string, repo: string, fromIso: string, toIso: string): Promise<RawActivityEvent[]>;
}

export function createGithubClient(token: string): GhClient {
  const gql = graphql.defaults({
    headers: { authorization: `token ${token}` },
  });

  async function fetchOrgMembers(org: string): Promise<MemberProfile[]> {
    const members: MemberProfile[] = [];
    let cursor: string | null = null;
    do {
      const data: any = await gql(
        `query($org: String!, $cursor: String) {
           organization(login: $org) {
             membersWithRole(first: 100, after: $cursor) {
               pageInfo { hasNextPage endCursor }
               nodes { login name avatarUrl bio url }
             }
           }
         }`,
        { org, cursor },
      );
      const conn = data.organization.membersWithRole;
      for (const m of conn.nodes) {
        if (m.login.endsWith('[bot]')) continue;
        members.push({
          login: m.login,
          name: m.name,
          avatarUrl: m.avatarUrl,
          bio: m.bio,
          htmlUrl: m.url,
        });
      }
      cursor = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (cursor);
    return members;
  }

  async function fetchOrgRepos(org: string): Promise<RepoSummary[]> {
    const repos: RepoSummary[] = [];
    let cursor: string | null = null;
    do {
      const data: any = await gql(
        `query($org: String!, $cursor: String) {
           organization(login: $org) {
             repositories(first: 100, after: $cursor, isArchived: false) {
               pageInfo { hasNextPage endCursor }
               nodes { name isArchived }
             }
           }
         }`,
        { org, cursor },
      );
      const conn = data.organization.repositories;
      for (const r of conn.nodes) {
        repos.push({ name: r.name, isArchived: r.isArchived });
      }
      cursor = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (cursor);
    return repos;
  }

  async function fetchRepoActivity(
    org: string,
    repo: string,
    fromIso: string,
    toIso: string,
  ): Promise<RawActivityEvent[]> {
    const events: RawActivityEvent[] = [];

    // (a) Commits via default branch history
    try {
      let cursor: string | null = null;
      do {
        const data: any = await gql(
          `query($owner: String!, $repo: String!, $since: GitTimestamp!, $until: GitTimestamp!, $cursor: String) {
             repository(owner: $owner, name: $repo) {
               defaultBranchRef {
                 target {
                   ... on Commit {
                     history(since: $since, until: $until, first: 100, after: $cursor) {
                       pageInfo { hasNextPage endCursor }
                       nodes {
                         committedDate
                         author { user { login } }
                       }
                     }
                   }
                 }
               }
             }
           }`,
          { owner: org, repo, since: fromIso, until: toIso, cursor },
        );
        const ref = data.repository.defaultBranchRef;
        if (!ref || !ref.target || !ref.target.history) {
          break; // empty repo or no default branch
        }
        const history = ref.target.history;
        for (const node of history.nodes) {
          const login = node.author?.user?.login;
          if (!login) continue;
          events.push({
            type: 'commits',
            actor: login,
            repoOwner: org,
            repoName: repo,
            occurredAt: node.committedDate,
          });
        }
        cursor = history.pageInfo.hasNextPage ? history.pageInfo.endCursor : null;
      } while (cursor);
    } catch (err) {
      console.error(`[github] commits query failed for ${org}/${repo}:`, err);
    }

    // (b) Pull requests with their reviews
    try {
      let cursor: string | null = null;
      let stop = false;
      do {
        const data: any = await gql(
          `query($owner: String!, $repo: String!, $cursor: String) {
             repository(owner: $owner, name: $repo) {
               pullRequests(first: 50, orderBy: { field: UPDATED_AT, direction: DESC }, after: $cursor) {
                 pageInfo { hasNextPage endCursor }
                 nodes {
                   createdAt updatedAt mergedAt merged
                   author { login }
                   reviews(first: 50) {
                     nodes { submittedAt author { login } }
                   }
                 }
               }
             }
           }`,
          { owner: org, repo, cursor },
        );
        const conn = data.repository.pullRequests;
        for (const pr of conn.nodes) {
          if (pr.updatedAt < fromIso) {
            stop = true;
            break;
          }
          const authorLogin = pr.author?.login;
          if (authorLogin) {
            if (pr.createdAt >= fromIso && pr.createdAt <= toIso) {
              events.push({
                type: 'prsOpened',
                actor: authorLogin,
                repoOwner: org,
                repoName: repo,
                occurredAt: pr.createdAt,
              });
            }
            if (pr.merged && pr.mergedAt && pr.mergedAt >= fromIso && pr.mergedAt <= toIso) {
              events.push({
                type: 'prsMerged',
                actor: authorLogin,
                repoOwner: org,
                repoName: repo,
                occurredAt: pr.mergedAt,
              });
            }
          }
          for (const review of pr.reviews.nodes) {
            const reviewLogin = review.author?.login;
            if (!reviewLogin) continue;
            if (review.submittedAt >= fromIso && review.submittedAt <= toIso) {
              events.push({
                type: 'reviews',
                actor: reviewLogin,
                repoOwner: org,
                repoName: repo,
                occurredAt: review.submittedAt,
              });
            }
          }
        }
        cursor = !stop && conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
      } while (cursor && !stop);
    } catch (err) {
      console.error(`[github] pull requests query failed for ${org}/${repo}:`, err);
    }

    // (c) Issues with labels and close timeline
    try {
      let cursor: string | null = null;
      let stop = false;
      do {
        const data: any = await gql(
          `query($owner: String!, $repo: String!, $cursor: String) {
             repository(owner: $owner, name: $repo) {
               issues(first: 50, orderBy: { field: UPDATED_AT, direction: DESC }, after: $cursor) {
                 pageInfo { hasNextPage endCursor }
                 nodes {
                   createdAt updatedAt closedAt closed
                   author { login }
                   labels(first: 10) { nodes { name } }
                   timelineItems(itemTypes: [CLOSED_EVENT], last: 1) {
                     nodes { ... on ClosedEvent { actor { login } createdAt } }
                   }
                 }
               }
             }
           }`,
          { owner: org, repo, cursor },
        );
        const conn = data.repository.issues;
        for (const issue of conn.nodes) {
          if (issue.updatedAt < fromIso) {
            stop = true;
            break;
          }
          const authorLogin = issue.author?.login;
          if (authorLogin && issue.createdAt >= fromIso && issue.createdAt <= toIso) {
            events.push({
              type: 'issuesOpened',
              actor: authorLogin,
              repoOwner: org,
              repoName: repo,
              occurredAt: issue.createdAt,
            });
          }
          if (issue.closed && issue.closedAt && issue.closedAt >= fromIso && issue.closedAt <= toIso) {
            const closedEvents = issue.timelineItems?.nodes ?? [];
            const closedEvent = closedEvents[closedEvents.length - 1];
            const closerLogin = closedEvent?.actor?.login ?? authorLogin;
            if (closerLogin) {
              events.push({
                type: 'issuesClosed',
                actor: closerLogin,
                repoOwner: org,
                repoName: repo,
                occurredAt: issue.closedAt,
                meta: { labels: (issue.labels?.nodes ?? []).map((l: any) => l.name) },
              });
            }
          }
        }
        cursor = !stop && conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
      } while (cursor && !stop);
    } catch (err) {
      console.error(`[github] issues query failed for ${org}/${repo}:`, err);
    }

    return events;
  }

  return { fetchOrgMembers, fetchOrgRepos, fetchRepoActivity };
}
