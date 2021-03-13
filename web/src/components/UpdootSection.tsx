import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import {
  PostSnippetFragment,
  useMeQuery,
  useVoteMutation,
} from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        aria-label="upvote"
        icon={<ChevronUpIcon />}
        fontSize="24px"
        isLoading={loadingState === "upvote-loading"}
        colorScheme={
          !fetching && data?.me && post.voteStatus === 1 ? "green" : undefined
        }
        onClick={async () => {
          setLoadingState("upvote-loading");
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
      />
      {post.points}
      <IconButton
        aria-label="downvote"
        icon={<ChevronDownIcon />}
        fontSize="24px"
        isLoading={loadingState === "downvote-loading"}
        colorScheme={
          !fetching && data?.me && post.voteStatus === -1 ? "red" : undefined
        }
        onClick={async () => {
          setLoadingState("downvote-loading");
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
      />
    </Flex>
  );
};
