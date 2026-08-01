import {
  PutItemCommand,
  PutItemInput,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { dynamoDBClient } from "./AWSClients";
import { CreateRequestType, EntryType } from "./types";

export const getUserEntries = async (
  userId: string,
): Promise<{ statusCode: number; headers: Object; body: string }> => {
  try {
    const command = new QueryCommand({
      TableName: "reading-list-table",
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
      KeyConditionExpression: "userId = :userId",
      Select: "ALL_ATTRIBUTES",
    });

    const results = await dynamoDBClient.send(command);

    const items = results.Items;

    if (!items) {
      console.log(`Dynamo retuned no items: ${results}`);
      throw new Error(`Error in retrieving data from dynamo`);
    }

    const transformedResults = items?.map((item) => transformedResult(item));
    return {
      statusCode: 200,
      body: JSON.stringify(transformedResults),
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "DELETE,GET,OPTIONS,POST,PUT",
      },
    };
  } catch (error) {
    console.log(`Error in retrieving data from dynamo: ${error}`);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "DELETE,GET,OPTIONS,POST,PUT",
      },
      body: JSON.stringify({
        message: `Error in retrieving data from dynamo: ${error}`,
      }),
    };
  }
};

const transformedResult = (item: any): EntryType => {
  return {
    id: item.id.S,
    userId: item.userId.S,
    listName: item.listName.S,
    createdAt: item.createdAt.S,
    author: item.author.S,
    title: item.title.S,
    genre: item.genre?.SS,
    serie: item.serie?.S,
    serieNumber: item.serieNumber?.N,
  };
};

export const createUserEntry = async (data: string, userId: string) => {
  const entry: CreateRequestType = JSON.parse(data);
  if (!entry.title) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "DELETE,GET,OPTIONS,POST,PUT",
      },
      body: JSON.stringify({
        message: "Validation error: Book Title is required",
      }),
    };
  }

  const item: any = {
    id: {
      S: uuidv4(),
    },
    userId: {
      S: userId,
    },
    listName: {
      S: entry.listName || "General",
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
    TableName: "reading-list-table",
    Item: item,
  };

  const command = new PutItemCommand(input);

  try {
    await dynamoDBClient.send(command);
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "DELETE,GET,OPTIONS,POST,PUT",
      },
    };
  } catch (error) {
    console.log(`Error in posting data from dynamo: ${error}`);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "DELETE,GET,OPTIONS,POST,PUT",
      },
      body: JSON.stringify({
        message: `Error in posting data from dynamo: ${error}`,
      }),
    };
  }
};
