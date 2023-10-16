import { Expression } from "./utils";

export enum SchemaVariant {
  "FIELD" = "FIELD",
  "FIELD_ARRAY" = "FIELD-ARRAY",
  "FIELD_OBJECT" = "FIELD-OBJECT",
  "VIEW" = "VIEW",
  "GROUP" = "GROUP",
  "FORM" = "FORM"
}

export type SchemaProperties<Properties> = {
  [K in keyof Properties]?: ({
    value?: Properties[K],
    reference?: Expression;
    conditions?: (
      {
        condition: Expression;
        value?: Properties[K];
        reference?: Expression;
      }
    )[]
  })
}

export type SchemaPropertiesInitiate<Properties> = Partial<SchemaProperties<Properties & { disabled: boolean; hidden: boolean; }>>


export type SchemaRule = {
  condition: Expression;
  value?: string;
  reference?: Expression;

}

export type SchemaOn = {
  // event_action
  values_changed_transform?: Expression;
  self_changed_override_values?: (
    {
      condition?: Expression;
      reference?: Expression;
      value?: Record<string, any>;
    }
  )[]
}

export type SchemaCore = {
  id?: string;
  variant: SchemaVariant;
  component: string;
  properties: any;
  config: Record<string, any>;
  rules?: SchemaRule[];
  on?: Record<string, any>;
  childs?: any;
}

export interface SchemaCoreField<Value, Properties = Record<string, any>, Config = Record<string, any>> extends SchemaCore {
  variant: SchemaVariant.FIELD,
  rules: SchemaRule[];
  config: Config & { name: string; defaultValue?: Value; };
  properties: SchemaPropertiesInitiate<Properties>;
  on?: SchemaOn;
}

export interface SchemaCoreView<Properties = Record<string, any>, Config = Record<string, any>,> extends SchemaCore {
  variant: SchemaVariant.VIEW,
  config: Config & { name?: string; };
  properties: SchemaPropertiesInitiate<Properties>;
}

export interface SchemaCoreGroup<Properties = Record<string, any>, Config = Record<string, any>> extends SchemaCore {
  variant: SchemaVariant.GROUP,
  config: Config & { name?: string; };
  properties: SchemaPropertiesInitiate<Properties>;
}

export interface SchemaCoreFieldArray<Value, Properties = Record<string, any>, Config = Record<string, any>> extends SchemaCore {
  variant: SchemaVariant.FIELD_ARRAY;
  rules: SchemaRule[];
  on?: SchemaOn;
  config: Config & { name: string; defaultValue?: Value; uniqueKey: string; };
  properties: SchemaPropertiesInitiate<Properties>;
}

export interface SchemaCoreFieldObject<Value, Properties = Record<string, any>, Config = Record<string, any>> extends SchemaCore {
  variant: SchemaVariant.FIELD_OBJECT,
  rules: SchemaRule[];
  on?: SchemaOn;
  config: Config & { name: string; defaultValue?: Value };
  properties: SchemaPropertiesInitiate<Properties>;
}

export interface SchemaFieldDefault extends SchemaCoreField<
  string | number,
  {
    title: string;
    subtitle: string;
  }
> {
  component: "DEFAULT"
}

export interface SchemaFieldViewDefault extends SchemaCoreView<
  {
    title: string;
    subtitle: string;
  }
> {
  component: "DEFAULT"
}

export interface SchemaGroupDefault extends SchemaCoreGroup<
  {
    title: string;
    subtitle: string;
  }
> {
  component: "DEFAULT";
  childs: SchemaDefault[]
}

export interface SchemaFieldArrayDefault extends SchemaCoreFieldArray<
  Record<string, any>[],
  {
    title: string;
    subtitle: string;
  }
> {
  component: "DEFAULT"
  childs: SchemaDefault[]
}

export interface SchemaFieldObjectDefault extends SchemaCoreFieldObject<
  Record<string, any>,
  {
    title: string;
    subtitle: string;
  }
> {
  component: "DEFAULT"
  childs: SchemaDefault[]
}

export type SchemaDefault = SchemaFieldDefault | SchemaFieldViewDefault | SchemaGroupDefault | SchemaFieldArrayDefault | SchemaFieldObjectDefault