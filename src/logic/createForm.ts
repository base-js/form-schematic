/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
import isEqual from "lodash.isequal";
import { FormEvent } from "react";
import { Expression, ObjectType, SchemaCore, SchemaVariant } from "../types";
import get from "../utils/get";
import set from "../utils/set";
import generateId from "../utils/generateId";
import cloneDeep from "../utils/cloneDeep";
import { parser } from "../configs/parser";

// eslint-disable-next-line no-unused-vars

export interface State {
  formState: {
    isSubmitting: boolean;
    isSubmitted: boolean;
    isSubmitSuccessful: boolean;
    isValidating: boolean;
  };
  formStateSupport: {
    isValid: boolean;
    isDirty: boolean;
  };
  props: {
    [key: string]: Partial<{
      disabled: Record<string, any>;
      hidden: Record<string, any>;
    }>
  };
  fieldsState: {
    touched: Record<string, boolean>;
    errors: Record<string, any>;
    values: Record<string, any>;
  };
  fieldsRef: Record<string, any>;
  trackOnState: {
    self_changed_override_values: Record<string, boolean>
  }
}

export interface Subject {
  fields: any[];
  containers: any[];
  supports: any[];
  extras: any[];
}

export type EventCallback = () => boolean

export interface Event {
  submit: Record<string, EventCallback>
}

export interface CreateFormProps<Schema> {
  initialValues: State["fieldsState"]["values"];
  schemas: Schema[];
  extraData?: Record<string, any>;
  shouldFocusError?: boolean;
  log?: (...args: any) => void;
}

interface ExecuteOption { parent: string; extraData: Record<string, any>; name: string }

export const initializeState: State = {
  formState: {
    isSubmitted: false,
    isSubmitSuccessful: false,
    isSubmitting: false,
    isValidating: false,
  },
  formStateSupport: {
    isValid: false,
    isDirty: false,
  },
  props: {
  },
  fieldsState: {
    touched: {},
    errors: {},
    values: {},
  },
  fieldsRef: {},
  trackOnState: {
    self_changed_override_values: {},
  },
};

export function getSchemaId<Schema extends SchemaCore = SchemaCore>(schema: Schema, parent?: string) {
  return `${parent ? `${parent}.` : ""}${schema.config?.name ?? schema.id}`;
}

export function getSchemaName<Schema extends SchemaCore = SchemaCore>(schema: Schema, parent?: string) {
  if (!schema.config?.name) return "";
  return `${parent ? `${parent}.` : ""}${schema.config?.name}`;
}

const createForm = <Schema extends SchemaCore>(props: CreateFormProps<Schema>) => {
  const _config: Omit<CreateFormProps<Schema>, "schema" | "log" | "shouldFocusError"> = {
    schemas: props.schemas,
    extraData: props.extraData || {},
    initialValues: props.initialValues || {},
  };

  const _state: State = cloneDeep(initializeState);

  const _event: Event = {
    submit: {},
  };

  const _subject: Subject = {
    fields: [],
    containers: [],
    supports: [],
    extras: [],
  };

  const parse = (expression: Expression, terms: Record<string, any> = {}) => parser.evaluate(expression, {
    ..._config.extraData,
    ..._state.fieldsState.values,
    ...terms,
  });

  function hasError() { return !!Object.keys(_state.fieldsState.errors).length; }
  // values
  function getValue(id?: string) {
    if (!id) return undefined;
    return get(_state.fieldsState.values, id);
  }
  // extras
  function getExtra(id?: string) {
    if (!id) return undefined;
    return get(_config.extraData, id);
  }
  function initValue(id: string, value: any) { set(_state.fieldsState.values, id, value); }
  // fieldState
  function getError(id?: string) {
    if (!id) return undefined;
    return _state.fieldsState.errors[id];
  }
  // values
  function getTouch(id?: string) {
    if (!id) return undefined;
    return _state.fieldsState.touched[id];
  }
  function initError(id: string, value: any) { _state.fieldsState.errors[id] = value; }
  function getField(state: keyof State["fieldsState"], id: string) { return _state.fieldsState[state]?.[id]; }
  function initField(state: keyof State["fieldsState"], id: string, value: any) {
    if (!_state.fieldsState[state]) _state.fieldsState[state] = {};
    _state.fieldsState[state][id] = value;
  }
  // props
  function initProp(name: keyof State["props"][keyof State["props"]], id: string, value: any) {
    if (!_state.props[id]) _state.props[id] = {};
    _state.props[id][name] = value;
  }

  function getProp(name: keyof State["props"][keyof State["props"]], id: string) {
    return _state.props[id]?.[name];
  }

  function getFieldState<Schema extends SchemaCore>(schema: Schema) {
    const id = getSchemaId(schema);
    return {
      value: getValue(id) as Schema["config"]["defaultValue"],
      error: getError(id),
      touched: getTouch(id),
      props: (_state.props[id] || {}) as { [K in keyof Schema["properties"]]?: NonNullable<Schema["properties"][K]>["value"] },
    };
  }

  function getViewState<
    Value = any,
    Schema extends SchemaCore = SchemaCore,
  >(schema: Schema) {
    const id = getSchemaId(schema);

    return {
      value: getValue(id) as Value,
      props: _state.props[id] as { [K in keyof Schema["properties"]]?: NonNullable<Schema["properties"][K]>["value"] },
    };
  }

  const subscribe = (subject: keyof Subject, callback: any) => {
    _subject[subject].push(callback);
    return () => {
      _subject[subject] = _subject[subject].filter((fn) => fn !== callback);
    };
  };

  const notify = (subject: keyof Subject) => {
    for (const fn of _subject[subject]) {
      fn();
    }
  };

  const setFocus = (id: string) => {
    const field = _state.fieldsRef[id]?.current;
    if (!field) {
      props.log?.(`ref "${id}" field not yet registered`);
      return;
    }

    if (field.focus) {
      field.focus();
    } else {
      props.log?.(`ref "${id}" focus not yet registered`);
    }
  };

  const setFormformState = (formStateValue: Partial<State["formState"]>) => {
    Object.assign(_state.formState, formStateValue);
  };

  const setSupportFormState = (formStateValue: Partial<State["formStateSupport"]>) => {
    Object.assign(_state.formStateSupport, formStateValue);
  };

  const setIsDirty = (options: { skipNotify: boolean } = { skipNotify: true }) => {
    if (!_state.formStateSupport.isDirty) {
      setSupportFormState({
        isDirty: !isEqual(props.initialValues, _state.fieldsState.values),
      });

      if (!options.skipNotify) {
        notify("supports");
      }
    }
  };

  const setFormStateSupportValid = (options: { skipNotify: boolean } = { skipNotify: false }) => {
    const isValid = !hasError();

    if (isValid !== _state.formStateSupport.isValid) {
      setSupportFormState({ isValid });

      if (!options.skipNotify) {
        notify("supports");
      }
    }
  };

  const updateTouch = (
    key: string,
    value: boolean = true,
    shouldRender: boolean = true,
  ) => {
    const isPreviousTouched = getField("touched", key);
    initField("touched", key, value);

    if (shouldRender && isPreviousTouched !== value) {
      notify("fields");
    }
  };

  function setValue(key: string, value: any, options: { skipNotify: boolean; skipTouch: boolean } = { skipNotify: false, skipTouch: false }) {
    initValue(key, value);

    // eslint-disable-next-line no-useless-return
    if (options?.skipNotify) return;

    if (!options?.skipTouch) {
      updateTouch(key, true, false);
    }
    // eslint-disable-next-line no-use-before-define
    executeExpression(key);
    notify("fields");
    setFormStateSupportValid();
    setIsDirty();
  }

  function setError(key: string, value: any, options: { skipNotify: boolean; } = { skipNotify: false }) {
    initError(key, value);

    // eslint-disable-next-line no-useless-return
    if (options?.skipNotify) return;

    notify("fields");
    setFormStateSupportValid();
    setIsDirty();
  }

  function setValues(values: State["fieldsState"]["values"], options: { skipNotify: boolean; } = { skipNotify: false }) {
    Object.entries(values).forEach(([key, value]) => {
      initValue(key, value);
    });

    // eslint-disable-next-line no-useless-return
    if (!options?.skipNotify) return;

    notify("fields");
    setIsDirty();
  }

  const executeSchemaOnValuesChangedTransform = <Schema extends SchemaCore>(
    schema: Schema,
    options: Partial<ExecuteOption> = { parent: "", extraData: {} },
  ) => {
    if (!schema.on?.values_changed_transform) return;

    const id = getSchemaId(schema, options.parent);
    try {
      initValue(
        id,
        parse(
          schema.on?.values_changed_transform as string,
          {
            ...options.extraData,
            __SELF__: getValue(id),
          },
        ),
      );
    } catch (error) {
      //
    }
  };

  const updateProps = (name: keyof State["props"][keyof State["props"]], id: string, config: any, terms: any) => {
    const { reference, value } = config;
    try {
      const result = (reference ? parse(reference, terms) : value);
      initProp(name, id, result);
    } catch (error) {
      if (value) {
        initProp(name, id, value);
      }
    }
  };

  const executeSchemaProperties = <Schema extends SchemaCore>(
    schema: Schema,
    options: Partial<ExecuteOption> = { parent: "", extraData: {} },
  ) => {
    const id = getSchemaId(schema, options.parent);
    const terms = { ...options.extraData, __SELF__: getValue(id) };

    for (const propertyKey in schema.properties) {
      const property = schema.properties[propertyKey];
      if (property?.conditions) {
        for (const { condition, value, reference } of property.conditions) {
          try {
            const result = parse(condition, terms);
            if (result) {
              updateProps(propertyKey as any, id, { value, reference }, terms);
              break;
            }
          } catch (error) {
            //
          }
        }
      } else if (property?.reference) {
        try {
          updateProps(propertyKey as any, id, { reference: property?.reference }, terms);
        } catch (error) {
          //
        }
      } else {
        //
      }
    }
  };

  function setValuesByOverride(values: Record<string, any>) {
    for (const id in values) {
      _state.trackOnState.self_changed_override_values[id] = true;
      initValue(id, values[id]);
    }
  }

  const executeSchemaOnSelfChangedOverrideValues = <Schema extends SchemaCore>(
    schema: Schema,
    options: Partial<ExecuteOption> = { parent: "", extraData: {}, name: "" },
  ) => {
    if (!schema.on?.self_changed_override_values) return;

    const id = getSchemaId(schema, options.parent);
    const terms = { ...options.extraData, __SELF__: getValue(id) };

    for (const { condition, reference, value } of schema.on?.self_changed_override_values) {
      if (condition) {
        try {
          if (parse(condition, terms)) {
            if (reference) {
              setValuesByOverride(parse(reference));
            } else {
              setValuesByOverride(value);
            }
          }
        } catch (error) {
          //
        }
      } else if (reference) {
        try {
          setValuesByOverride(parse(reference, terms));
        } catch (error) {
          //
        }
      } else if (value) {
        setValuesByOverride(value);
      }
    }
  };

  const executeSchemaRules = <Schema extends SchemaCore>(
    schema: Schema,
    options: Partial<ExecuteOption> = { parent: "", extraData: {} },
  ) => {
    if (!schema.rules) return;

    const id = getSchemaId(schema, options.parent);
    const terms = { ...options.extraData, __SELF__: getValue(id) };

    for (const { condition, reference, value } of schema.rules) {
      try {
        if (parse(condition, terms)) {
          if (reference) {
            initError(id, parse(reference));
          } else {
            initError(id, value);
          }
          break;
        }
      } catch (error) {
        //
      }
    }
  };

  const executeSchemaArray = (
    schema: Schema[],
    options: Partial<ExecuteOption> = { parent: "", extraData: {} },
  ) => {
    if (getError(options.parent)) return;

    const value = getValue(options.parent) || [];
    for (let index = 0; index < value.length; index++) {
      // eslint-disable-next-line no-use-before-define
      executeSchema(schema as Schema[], {
        parent: `${options.parent}.${index}`,
        extraData: {
          __ITEM__: getValue(`${options.parent}.${index}`),
          __INDEX__: index,
        },
      });
    }
  };

  const executeSchemaObject = (
    schema: Schema[],
    options: Partial<ExecuteOption> = { parent: "", extraData: {} },
  ) => {
    if (getError(options.parent)) return;

    // eslint-disable-next-line no-use-before-define
    executeSchema(schema as Schema[], {
      parent: `${options.parent}`,
    });
  };

  const executeSchema = <Schema extends SchemaCore>(
    schemas: Schema[],
    options: Partial<ExecuteOption> = { parent: "", extraData: {} },
  ) => {
    if (!schemas) return;

    for (const schema of schemas) {
      const id = getSchemaId(schema as Schema, options.parent);

      if (
        schema.variant === SchemaVariant.FIELD
        || schema.variant === SchemaVariant.FIELD_ARRAY
        || schema.variant === SchemaVariant.FIELD_OBJECT
      ) {
        if (options.name === id) {
          executeSchemaOnSelfChangedOverrideValues(schema, options);
        } else if (!_state.trackOnState.self_changed_override_values[schema.config?.name!]) {
          executeSchemaOnValuesChangedTransform(schema, options);
        }
      }

      executeSchemaProperties(schema, options);

      // skip when hidden is false
      if (getProp("hidden", id)) continue;

      if (schema.variant === SchemaVariant.GROUP) {
        executeSchema(schema.childs!, options);
        continue;
      }

      // execute rules except view
      if (schema.variant === SchemaVariant.VIEW) continue;

      if (schema.variant === SchemaVariant.FIELD) {
        executeSchemaRules(schema, options);
        continue;
      }

      if (schema.variant === SchemaVariant.FIELD_ARRAY) {
        executeSchemaRules(schema, options);
        executeSchemaArray(
          schema.childs!,
          {
            ...options,
            parent: id,
          },
        );
        continue;
      }

      if (schema.variant === SchemaVariant.FIELD_OBJECT) {
        executeSchemaRules(schema, options);
        executeSchemaObject(
          schema.childs!,
          {
            ...options,
            parent: id,
          },
        );
        continue;
      }
    }
  };

  const executeExpression = (name?: string) => {
    _state.fieldsState.errors = {};
    _state.trackOnState.self_changed_override_values = {};
    _state.props = {};

    executeSchema(_config.schemas as Schema[], { extraData: {}, name });
  };

  const initializeValues = (schemas: Schema[]) => {
    for (const schema of schemas) {
      try {
        if (schema.variant === SchemaVariant.FIELD || schema.variant === SchemaVariant.FIELD_ARRAY || schema.variant === SchemaVariant.FIELD_OBJECT) {
          const key = getSchemaId(schema);
          set(
            _state.fieldsState.values,
            key,
            schema.config.defaultValue,
          );
        } else if (schema.variant === "GROUP") {
          initializeValues(schema.childs);
        }
      } catch (error) {
        props.log?.("error on initializeValues", error);
      }
    }
  };

  const generatedSchemaId = (schemas: Schema[]) => {
    for (const schema of schemas) {
      if (!schema.id) {
        schema.id = schema.variant + schema.component + generateId();
      }

      if (schema.variant === "FIELD-ARRAY" && Array.isArray(schema.childs)) {
        generatedSchemaId(schema.childs);
      } else if (schema.variant === "FIELD-OBJECT" && Array.isArray(schema.childs)) {
        generatedSchemaId(schema.childs);
      } else if (schema.variant === "GROUP" && Array.isArray(schema.childs)) {
        generatedSchemaId(schema.childs);
      }
    }
  };

  const reset = ({
    initialValues = _config.initialValues,
    schemas = _config.schemas,
    extraData = _config.extraData,
  }: Partial<Omit<CreateFormProps<Schema>, "formula">>) => {
    try {
      props.log?.("prev config =", { ..._config });
      props.log?.("prev state =", { ..._state });

      // === reset
      _config.schemas = schemas;
      _config.initialValues = initialValues;
      _config.extraData = extraData;

      Object.assign(_state, cloneDeep(initializeState));

      // generate key
      generatedSchemaId(_config.schemas as Schema[]);

      // initialize
      initializeValues(_config.schemas as Schema[]);
      Object.assign(_state.fieldsState.values, cloneDeep(_config.initialValues));

      executeExpression();
      setFormStateSupportValid();
      notify("containers");
      notify("fields");
      notify("supports");

      props.log?.("curr config =", { ..._config });
      props.log?.("curr state =", { ..._state });
    } catch (error) {
      props.log?.("failed reset =", error);
    }
  };

  const executeEventSubmit = () => {
    for (const key in _event.submit) {
      const callback = _event.submit[key];
      if (!callback()) {
        initError(key, "FORM-INVALID");
        break;
      }
    }
  };

  const handleSubmit = (
    onValid: (values: State["fieldsState"]["values"], state?: State) => Promise<void> | void,
    onInvalid?: (
      values: State["fieldsState"]["values"],
      errors: State["fieldsState"]["errors"],
      type?: "ON-SCHEMA" | "ON-SUBMIT",
      istate?: State
    ) => void,
    options: { forceSubmit: boolean; } = { forceSubmit: false },
  ) => async (event: FormEvent) => {
    props.log?.("handleSubmit triggered");
    event?.stopPropagation();
    event?.preventDefault();

    try {
      _state.formState.isSubmitting = true;
      notify("containers");

      executeEventSubmit();
      executeExpression();

      if (hasError() && !options.forceSubmit) {
        if (props.shouldFocusError) {
          const name = Object.keys(_state.fieldsState.errors)[0];
          setFocus(name);
          props.log?.(`trigger focus ${name}`);
        }

        _state.formState.isSubmitSuccessful = false;
        onInvalid?.(_state.fieldsState.values, _state.fieldsState.errors, "ON-SCHEMA", _state);
      } else {
        _state.formState.isSubmitSuccessful = true;
        await onValid(_state.fieldsState.values, _state);
      }
    } catch (error) {
      _state.formState.isSubmitSuccessful = false;
      onInvalid?.(_state.fieldsState.values, _state.fieldsState.errors, "ON-SUBMIT", _state);
      //
    } finally {
      _state.formState.isSubmitting = false;
      _state.formState.isSubmitted = true;
      notify("containers");
      notify("fields");
      notify("supports");
    }
  };

  reset({});

  return {
    config: _config,
    state: _state,
    subject: _subject,
    event: _event,
    parse,
    setFormformState,
    setSupportFormState,
    getValue,
    getExtra,
    setValue,
    getError,
    setError,
    getTouch,
    getProp,
    setValues,
    setFocus,
    handleSubmit,
    reset,
    getField,
    subscribe,
    notify,
    getSchemaId,
    getFieldState,
    getViewState,
    updateTouch,
  };
};

export type Form<T extends SchemaCore> = ReturnType<typeof createForm<T>>

export default createForm;
