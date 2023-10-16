import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { FormContext } from "../contexts/FormContext";
import generateId from "../utils/generateId";
import { SchemaCore } from "../types";
import { Form } from "../logic/createForm";
import useSubscribe from "./useSubscribe";

// eslint-disable-next-line no-use-before-define
export const useFieldArray = <Schema extends SchemaCore = SchemaCore>(props: {
  ctx?: Form<Schema>;
  schema: Schema;
  log?: () => void;
}) => {
  const { ctx: context } = useContext(FormContext);
  const { ctx = context, schema } = props;
  const _ref = useRef<any>();

  const identity = useMemo(() => schema.config?.name || schema.id || generateId(), [schema]);

  useSubscribe({
    ctx,
    getState() {
      const state = ctx.getFieldState(schema);
      const { unqiueKey } = props.schema.config;
      const value = state.value.map((item: any) => (unqiueKey ? item[unqiueKey] : item));
      return {
        ...state,
        value,
      };
    },
    subject: "fields",
  });

  useSubscribe({
    ctx,
    subject: "containers",
  });

  useEffect(() => {
    ctx.state.fieldsRef[identity] = _ref;
    return () => {
      delete ctx.state.fieldsRef[identity];
    };
  }, [identity]);

  return {
    state: ctx.getFieldState<
      Schema["config"]["defaultValue"], { [K in keyof Schema["properties"]]?: NonNullable<Schema["properties"][K]>["value"] }
    >(schema as any),
    formState: ctx.state.formState,
    ref: _ref,
    ctx,
    onChange: useCallback(
      (arg: any) => {
        if (typeof arg === "function") {
          ctx.setValue(identity, arg(ctx.state.fieldsState.values));
        } else {
          ctx.setValue(identity, arg);
        }
      },
      [identity, ctx],
    ),
    onBlur: useCallback(
      () => ctx.updateTouch(identity),
      [identity, ctx],
    ),
  };
};

export default useFieldArray;
