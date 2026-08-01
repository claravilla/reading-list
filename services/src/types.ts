export type EntryType =  {
      id: string,
      userId: string,
      listName: string,
      createdAt: string,
      author: string,
      title: string,
      genre?: string[],
      serie?: string,
      serieNumber?: string,
}


export type CreateRequestType = {
      userId: string,
      listName: string,
      author: string,
      title: string,
      genre?: string[],
      serie?: string,
      serieNumber?: string, 
}

