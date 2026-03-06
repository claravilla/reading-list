import { PutItemCommand, PutItemInput } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { dynamoDBClient } from "./AWSClients";
import { EntryType } from "./types";

export default async (entry: EntryType, user: string) => {
  const item: any = {
    id: {
      S: uuidv4(),
    },

    user: {
      S: user,
    },

    listName: {
      S: entry.listName,
    },
    createdAt: {
      S: new Date().toISOString(),
    },
    author: {
      S: entry.author,
    },
    title: {
      S: entry.title,
    },
  };

  if (entry.genre) {
    item.genre = { SS: entry.genre };
  }
  if (entry.serie) {
    item.serie = { S: entry.serie };
  }

  if (entry.serieNumber) {
    item.serieNumber = { S: entry.serieNumber };
  }

  const input: PutItemInput = {
    TableName: "reading-entries",
    Item: item,
  };

  const command = new PutItemCommand(input);

  try {
    await dynamoDBClient.send(command);
    return "Entry added correctly";
  } catch (error) {
    console.log(`Error in posting data from dynamo: ${error}`);
    throw new Error(`Error in posting data from dynamo: ${error}`);
  }
};
