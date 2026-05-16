import { graphql } from '@octokit/graphql';
import type { RawActivityEvent, MemberProfile } from './types';

interface GhClient {
  fetchOrgMembers(org: string): Promise<MemberProfile[]>;
  fetchContributions(login: string, fromIso: string, toIso: string): Promise<RawActivityEvent[]>;
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

  async function fetchContributions(login: string, fromIso: string, toIso: string): Promise<RawActivityEvent[]> {
    const events: RawActivityEvent[] = [];
    const data: any = await gql(
      `query($login: String!, $from: DateTime!, $to: DateTime!) {
         user(login: $login) {
           contributionsCollection(from: $from, to: $to) {
             commitContributionsByRepository(maxRepositories: 100) {
               repository { owner { login } name }
               contributions(first: 100) { nodes { occurredAt commitCount } }
             }
             pullRequestContributions(first: 100) {
               nodes {
                 occurredAt
                 pullRequest { merged mergedAt repository { owner { login } name } }
               }
             }
             pullRequestReviewContributions(first: 100) {
               nodes { occurredAt pullRequestReview { state pullRequest { repository { owner { login } name } } } }
             }
             issueContributions(first: 100) {
               nodes { occurredAt issue { repository { owner { login } name } } }
             }
           }
         }
       }`,
      { login, from: fromIso, to: toIso },
    );

    const cc = data.user.contributionsCollection;

    for (const repo of cc.commitContributionsByRepository) {
      for (const node of repo.contributions.nodes) {
        for (let i = 0; i < node.commitCount; i++) {
          events.push({
            type: 'commits',
            repoOwner: repo.repository.owner.login,
            repoName: repo.repository.name,
            occurredAt: node.occurredAt,
          });
        }
      }
    }

    for (const node of cc.pullRequestContributions.nodes) {
      const pr = node.pullRequest;
      events.push({
        type: 'prsOpened',
        repoOwner: pr.repository.owner.login,
        repoName: pr.repository.name,
        occurredAt: node.occurredAt,
      });
      if (pr.merged && pr.mergedAt && pr.mergedAt >= fromIso && pr.mergedAt <= toIso) {
        events.push({
          type: 'prsMerged',
          repoOwner: pr.repository.owner.login,
          repoName: pr.repository.name,
          occurredAt: pr.mergedAt,
        });
      }
    }

    for (const node of cc.pullRequestReviewContributions.nodes) {
      const r = node.pullRequestReview;
      events.push({
        type: 'reviews',
        repoOwner: r.pullRequest.repository.owner.login,
        repoName: r.pullRequest.repository.name,
        occurredAt: node.occurredAt,
      });
    }

    for (const node of cc.issueContributions.nodes) {
      events.push({
        type: 'issuesOpened',
        repoOwner: node.issue.repository.owner.login,
        repoName: node.issue.repository.name,
        occurredAt: node.occurredAt,
      });
    }

    return events;
  }

  return { fetchOrgMembers, fetchContributions };
}
