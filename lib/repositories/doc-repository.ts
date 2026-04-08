export type JsonDoc = {
  id: string;
  title: string;
  body: unknown;
  updatedAt: string;
};

export type JsonDocListItem = Pick<JsonDoc, "id" | "title" | "updatedAt">;

export type JsonDocUpdateInput = {
  title: string;
  body: unknown;
};

export interface DocRepository {
  listDocs(): Promise<JsonDocListItem[]>;
  getDoc(id: string): Promise<JsonDoc | null>;
  updateDoc(id: string, input: JsonDocUpdateInput): Promise<JsonDoc | null>;
}
