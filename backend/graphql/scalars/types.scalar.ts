import { GraphQLScalarType, Kind } from "graphql";

const StringOrIntScalarType = new GraphQLScalarType({
    name: "StringOrInt",
    serialize(value) {
        if (typeof value === "number" || typeof value === "string") return value
        throw new Error("value is not String | Number")
    },
    
    parseValue(value) {
        if (typeof value === "number" || typeof value === "string") return value
        throw new Error("value is not String | Number")
    },
    
    parseLiteral(ast) {
        if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
            return ast.value
        }
        throw new Error("value is not String | Number")
    }
})

export default StringOrIntScalarType