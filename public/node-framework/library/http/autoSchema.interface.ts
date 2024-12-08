export interface AutoSchema {
  model: string
  key: string
  route: string
  fields: FieldSchema[]
  ui?: UISchema
}

export interface FieldSchema {
  name: string
  dbName?: string
  type: string
  unique?: boolean
  required?: boolean
  create?: boolean
  update?: boolean
  view?: boolean
  /**
   * Propriedades de validação usado pelo front
   */
  properties: PropertySchema
}

export interface PropertySchema {
  label?: string
}

export interface UISchema {
  createButton?: {
    label: string
  }
  form?: {
    createTitle: string
    updateTitle: string
  }
}
