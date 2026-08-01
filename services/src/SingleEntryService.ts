import { PutItemCommand, PutItemInput } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { dynamoDBClient } from "./AWSClients";
import { EntryType } from "./types";



