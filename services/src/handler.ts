import { createUserEntry, getUserEntries } from "./UserEntriesService";

export const handler = async (event: any) => {
  // extract method and url

  console.log("REQUEST", event);

  const method = event.requestContext.httpMethod;
  const body = event.body;
  const userId = event.pathParameters?.userId;
  const entryId = event.pathParameters?.entryId;

  if (!userId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "DELETE,GET,OPTIONS,POST,PUT",
      },
      body: JSON.stringify({ message: "Validation error: userId is required" }),
    };
  }

  if (method === "GET") {
    return getUserEntries(userId);
  }

  if (method === "POST") {
    if (!body) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Headers":
            "Content-Type,Authorization,X-Api-Key",
          "Access-Control-Allow-Methods": "DELETE,GET,OPTIONS,POST,PUT",
        },
        body: JSON.stringify({
          message: "Validation error: cannot POST an empty body",
        }),
      };
    }
    return createUserEntry(body, userId);
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
      "Access-Control-Allow-Methods": "DELETE,GET,OPTIONS,POST,PUT",
    },
    body: JSON.stringify({ message: "This works" }),
  };
};
