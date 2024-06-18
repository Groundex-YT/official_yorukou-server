const kistuEpisodeDefaultQuery = `
            __typename
            ... on Anime {
                id
                episodes(first: 2000) {
                    nodes {
                        number
                        titles {
                            canonical
                        }
                        createdAt
                        releasedAt
                        length
                        description
                        thumbnail {
                            original {
                                url
                            }
                        }
                    }
                }
            }
`;

export const kitsuEpisodesQuery = (id: number) =>
    `
    query {
        lookupMapping(externalId: ${id}, externalSite: ANILIST_ANIME) {
            ${kistuEpisodeDefaultQuery}
        }
    }
`;
