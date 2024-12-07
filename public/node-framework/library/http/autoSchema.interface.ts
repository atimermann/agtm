export interface AutoSchema {
  model: string;
  key: string;
  route: string;
  fields: FieldSchema[];
  ui?: UISchema;
}

export interface FieldSchema {
  name: string;
  dbName?: string;
  type: string;
  unique?: boolean;
  required?: boolean;
  create?: boolean;
  update?: boolean;
  view?: boolean;
  properties?: any;
}

export interface UISchema {
  createButton?: {
    label: string;
  };
  form?: {
    newTitle: string;
    updateTitle: string;
  };
}
