/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-use-before-define */
/* eslint-disable react/require-default-props */
/* eslint-disable consistent-return */
/* eslint-disable react/jsx-key */
import { FC, Fragment, Suspense, useContext, useMemo } from "react";
import { Form, getSchemaName } from "../logic/createForm";
import { FormContext } from "../contexts";
import { SchemaCore } from "../types";
import { FormUiContext } from "../contexts/FormUiContext";
import set from "../utils/set";
import generateId from "../utils/generateId";

const updateSchemaConfigName = <Schema extends SchemaCore = SchemaCore>(schema: Schema, name: string): any => {
  if (!name) return schema;
  const overrideSchema = { ...schema, config: { ...schema.config } };
  set(overrideSchema, "config.name", name);
  return overrideSchema;
};

export function ComponentGateway<Schema extends SchemaCore = SchemaCore>({
  wrapper,
  schema,
  parent,
  groupId,
  error: Error,
  loading: Loading,
  ctx,
}: {
  ctx: Form<Schema>,
  schema: Schema;
  groupId: string;
  parent?: string;
  wrapper?: any;
  loading: FC<{ schema: Schema }>;
  error: FC<{ message: string; schema: Schema }>;
}) {
  const { components } = useContext(FormUiContext);
  const identity = getSchemaName(schema, parent);
  const generatedGroupId = useMemo(() => (groupId) + generateId(), [ctx]);

  if (schema.variant === "FIELD") {
    const Component = components[schema.variant][schema.component];
    if (!Component) return <Error schema={schema} message="Component not found" />;

    return (
      <Suspense fallback={<Loading schema={schema} />}>
        <Component
          wrapper={wrapper}
          schema={updateSchemaConfigName(schema, identity)}
        />
      </Suspense>
    );
  }

  if (schema.variant === "VIEW") {
    const Component = components[schema.variant][schema.component];
    if (!Component) return <Error schema={schema} message="Component not found" />;

    return (
      <Suspense fallback={<Loading schema={schema} />}>
        <Component
          wrapper={wrapper}
          schema={updateSchemaConfigName(schema, identity)}
        />
      </Suspense>
    );
  }

  if (schema.variant === "GROUP") {
    const Component = components[schema.variant][schema.component];
    if (!Component) return <Error schema={schema} message="Component not found" />;

    return (
      <Suspense fallback={<Loading schema={schema} />}>
        <Component
          wrapper={wrapper}
          schema={schema}
        >
          <FormGenerator
            parent={parent}
            schemas={schema.childs}
            loading={Loading}
            error={Error}
            wrapper={wrapper}
            groupId={generatedGroupId}
          />
        </Component>
      </Suspense>
    );
  }

  if (schema.variant === "FIELD-ARRAY") {
    const Component = components[schema.variant][schema.component];
    if (!Component) return <Error schema={schema} message="Component not found" />;

    return (
      <Suspense fallback={<Loading schema={schema} />}>
        <Component
          wrapper={wrapper}
          schema={schema}
        >
          {({ value, container: Container, containerProps }, indexContainer) => (
            <Fragment key={indexContainer}>
              {value?.map((_: any, indexValue: number) => (
                <Container
                  index={indexValue}
                  schema={schema}
                  key={`${parent}-${identity}-${indexContainer}-${indexValue}-${generatedGroupId}`}
                  containerProps={containerProps}
                >
                  <FormGenerator
                    parent={`${identity}.${indexValue}`}
                    schemas={schema.childs}
                    groupId={generatedGroupId}
                    loading={Loading}
                    error={Error}
                    wrapper={wrapper}
                  />
                </Container>
              ))}
            </Fragment>
          )}
        </Component>
      </Suspense>
    );
  }

  if (schema.variant === "FIELD-OBJECT") {
    const Component = components[schema.variant][schema.component];
    if (!Component) return <Error schema={schema} message="Component not found" />;

    return (
      <Suspense fallback={<Loading schema={schema} />}>
        <Component
          wrapper={wrapper}
          schema={schema}
        >
          {({ container: Container, containerProps }, indexValue) => (
            <Container
              index={indexValue}
              schema={schema}
              key={`${identity}`}
              containerProps={containerProps}
            >
              <FormGenerator
                parent={`${identity}`}
                schemas={schema.childs}
                loading={Loading}
                error={Error}
                wrapper={wrapper}
                groupId={generatedGroupId}
              />
            </Container>
          )}
        </Component>
      </Suspense>
    );
  }

  return <Error schema={schema} message="Variant not found" />;
}

export function FormGenerator<Schema extends SchemaCore = SchemaCore>(props: {
  schemas?: Schema[];
  parent?: string;
  wrapper?: any;
  groupId?: string;
  loading?: FC<{ schema: Schema }>;
  error?: FC<{ message: string; schema: Schema }>;
}) {
  const { ctx } = useContext(FormContext);
  const {
    schemas = ctx.config.schemas,
    parent = "",
    wrapper = ({ children }: any) => <>{children}</>,
    loading = () => <></>,
    error = () => <></>,
    groupId = "",
  } = props;

  const generatedGroupId = useMemo(() => (groupId) + generateId(), [ctx]);

  return (
    <>
      {schemas.map((schema) => {
        const key = schema.variant + schema.component + (schema.config?.name || "") + (schema.id || "") + parent + generatedGroupId;
        return (
          <ComponentGateway
            key={key}
            groupId={generatedGroupId}
            wrapper={wrapper}
            parent={parent}
            schema={schema}
            ctx={ctx}
            loading={loading}
            error={error}
          />
        );
      })}
    </>
  );
}

export default FormGenerator;