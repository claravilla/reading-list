import CreateNewEntryService from "./CreateNewEntryService";
import GetReadingEntriesService from "./GetReadingEntriesService";

export const handler = async (event: any) =>{
  // extract method and url

  console.log("REQUEST", event)

  const method = event.requestContext.http.method;
//   const body = event.body;
  const user = event.pathParameters?.username;
  console.log("USER", user)
//   const path = event.path;
//   //return correct service

//   console.log("METHOD", method)
//   console.log("USER", user)
//   console.log("PATH", path)
//   console.log("METHOD", method)

//   if (method === "GET" && user !== undefined) {
//     return GetReadingEntriesService(user);
//   }

//   if (method === "POST" && body != null && user != null) {
//     return CreateNewEntryService(body, user);
//   }

  return "this works"
};

