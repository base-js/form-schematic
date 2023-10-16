/* eslint-disable jest/expect-expect */
/* eslint-disable no-console */
import { SchemaCoreField, SchemaDefault, SchemaVariant } from "../../types";
import createForm from "../createForm";

test("validate error schema", () => {
  interface SchemaFieldXDefault extends SchemaCoreField<{ title: string }, { name: string }> {
    variant: SchemaVariant.FIELD,
    childs: [];
    component: "XDEFAULT"
  }

  type Schema = SchemaFieldXDefault | SchemaDefault

  const form = createForm<Schema>({
    initialValues: {},
    schemas: [
      {
        variant: SchemaVariant.FIELD,
        component: "DEFAULT",
        rules: [
          { condition: "first > 20", value: "error" },
        ],
        config: {
          name: "first",
          defaultValue: 123,
        },
        properties: {
          title: {
            value: "sdf",
          },
        },
        on: {
          self_changed_override_values: [
            { value: { second: 666 } },
          ],
        },
      },
      {
        variant: SchemaVariant.FIELD,
        component: "DEFAULT",
        config: {
          name: "second",
          defaultValue: 555,
        },
        rules: [
          { condition: "second > 20", value: "second higher than 20" },
        ],
        properties: {
          hidden: {
            conditions: [
              { condition: "first > 20", value: true },
            ],
          },
        },
      },
      {
        variant: SchemaVariant.FIELD_ARRAY,
        component: "DEFAULT",
        config: {
          name: "array",
          defaultValue: [
            { first: 50 },
          ],
          uniqueKey: "first",
        },
        properties: {},
        rules: [],
        childs: [
          {
            variant: SchemaVariant.FIELD,
            component: "DEFAULT",
            config: {
              name: "first",
              defaultValue: 50,
            },
            rules: [
              { condition: "__ITEM__.first > 20", value: "first higher 20" },
            ],
            properties: {},
          },
          {
            variant: SchemaVariant.FIELD,
            component: "DEFAULT",
            config: {
              name: "second",
              defaultValue: 555,
            },
            rules: [
              { condition: "second > 20", value: "second higher 20" },
            ],
            properties: {},
          },
        ],
      },
      {
        variant: SchemaVariant.FIELD_OBJECT,
        component: "DEFAULT",
        config: {
          name: "object",
          defaultValue: { first: 50 },
        },
        properties: {},
        rules: [],
        childs: [
          {
            variant: SchemaVariant.FIELD,
            component: "DEFAULT",
            rules: [
              { condition: "__SELF__ > 20", value: "higher than 20" },
            ],
            config: {
              name: "first",
              defaultValue: "",
            },
            properties: {},
          },
          {
            variant: SchemaVariant.FIELD,
            component: "DEFAULT",
            config: {
              name: "second",
              defaultValue: 555,
            },
            rules: [],
            properties: {},
          },
        ],
      },
      {
        variant: SchemaVariant.FIELD,
        component: "DEFAULT",
        rules: [],
        config: {
          name: "values_changed_transform",
          defaultValue: 123,
        },
        properties: {
          title: {
            value: "sdf",
          },
        },
        on: {
          values_changed_transform: "first * 2",
        },
      },
    ],
  });

  expect(form.state.fieldsState.values).toEqual({
    first: 123,
    second: 555,
    array: [{ first: 50 }],
    object: { first: 50 },
    values_changed_transform: 246,
  });
  expect(form.state.fieldsState.errors).toEqual({
    first: "error",
    "array.0.first": "first higher 20",
    "array.0.second": "second higher 20",
    "object.first": "higher than 20",
  });

  form.setValue("first", 10);

  expect(form.state.fieldsState.errors).toEqual({
    "array.0.first": "first higher 20",
    "array.0.second": "second higher 20",
    "object.first": "higher than 20",
    second: "second higher than 20",
  });

  expect(form.state.fieldsState.values).toEqual({
    first: 10,
    array: [{
      first: 50,
    }],
    object: {
      first: 50,
    },
    second: 666,
    values_changed_transform: 20,
  });
  expect(form.state.trackOnState).toEqual({ self_changed_override_values: { second: true } });
});
