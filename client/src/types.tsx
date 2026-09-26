// CLIENT TYPE

export type ReadingEntryType = {
  id: string;
  userId: string;
  listName: string;
  createdAt: string;
  author: string;
  title: string;
  genre?: string[];
  serie?: string;
  serieNumber?: number;
};

export type ClientCreateEntryDataType = {
  title: string;
  author: string;
  userId: string;
};

// SERVER TYPE
export type textExtractEntryType = {
  title: string;
  author: string;
};

export type ServerCreateEntryDataType = {
  title: string;
  author: string;
};
