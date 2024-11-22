export interface ArtifactModel {
  count: number
  value: Artifacts[]
}

export interface Artifacts {
  id: number
  name: string
  source: string
  resource: Resource
}

export interface Resource {
  type: string
  data: string
  properties: Properties
  url: string
  downloadUrl: string
}

export interface Properties {
  RootId?: string
  artifactsize: string
  HashType?: string
  DomainId?: string
  localpath?: string
}
