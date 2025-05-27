
const DecksTypeDefs = `#graphql
    enum DeckType { root, sub }

	type Deck {
		deckID: String!
        title: String!
        ownerDocID: String!
        createdAt: String!
        parentDeckID: String
        savedPosts: [Post]
        savedPostDocIDs: [String]
        subDecks: [Deck]
        type: DeckType!
	}
`
export default DecksTypeDefs