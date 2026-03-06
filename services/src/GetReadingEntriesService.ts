import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDBClient } from "./AWSClients";
import { EntryType } from "./types";

export default async (user: string): Promise<EntryType[]> => {
  try {
    console.log("IM HERE")
    const command = new QueryCommand({
      TableName: "Entries",
      ExpressionAttributeValues: {
        user: {
          S: `${user}`,
        },
      },
      KeyConditionExpression: "User = :user",
    });

    const results = await dynamoDBClient.send(command);

    const items = results.Items;

    if (!items) {
      console.log(`Dynamo retuned no items: ${results}`);
      throw new Error(`Error in retrieving data from dynamo`);
    }

    const transformedResults = items?.map((item) => transformedResult(item));

    return transformedResults;
  } catch (error) {
    console.log(`Error in retrieving data from dynamo: ${error}`);
    throw new Error(`Error in retrieving data from dynamo: ${error}`);
  }
};

const transformedResult = (item: any): EntryType => {
  return {
    id: item.id.S,
    user: item.user.S,
    listName: item.listName.S,
    createdAt: item.createdAt.S,
    author: item.author.S,
    title: item.title.S,
    genre: item.genre.SS,
    serie: item.serie.S,
    serieNumber: item.serieNumber.N,
  };
};
