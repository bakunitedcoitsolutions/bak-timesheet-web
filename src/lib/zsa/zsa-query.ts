"use client";
import {
  useQuery as useRQQuery,
  useMutation as useRQMutation,
  useInfiniteQuery as useRQInfiniteQuery,
} from "@tanstack/react-query";
import { setupServerActionHooks } from "zsa-react-query";

export const {
  useServerActionQuery: useQuery,
  useServerActionMutation: useMutation,
  useServerActionInfiniteQuery: useInfiniteQuery,
} = setupServerActionHooks({
  hooks: {
    useQuery: useRQQuery,
    useMutation: useRQMutation,
    useInfiniteQuery: useRQInfiniteQuery,
  },
});
