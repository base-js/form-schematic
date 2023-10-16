import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { Form } from "../logic/createForm";
import { SchemaCore } from "../types";
import { FormContext } from "../contexts/FormContext";
import generateId from "../utils/generateId";
import useSubscribe from "./useSubscribe";

export const useField = <Schema extends SchemaCore>(props: {
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
      return ctx.getFieldState(schema);
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

  const state = ctx.getFieldState(schema);

  return {
    state,
    ctx,
    formState: ctx.state.formState,
    ref: _ref,
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
    getProp: useCallback(
      // eslint-disable-next-line no-undef
      <K extends keyof Schema["properties"]>(key: K): NonNullable<Schema["properties"][K]>["value"] => state.props?.[key] ?? schema.properties[key].value,
      [identity, state, schema],
    ),
  };
};

export default useField;