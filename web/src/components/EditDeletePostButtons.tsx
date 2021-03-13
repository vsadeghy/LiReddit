import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
}) => {
  const [, deletePost] = useDeletePostMutation();
  return (
    <Flex direction="column" align="center">
      <NextLink href="/post/edit/[id]" as={`post/edit/${id}`}>
        <IconButton
          as={Link}
          ml="auto"
          backgroundColor="whitesmoke"
          aria-label="edit"
          icon={<EditIcon />}
          fontSize="24px"
        />
      </NextLink>

      <IconButton
        ml="auto"
        mt={4}
        backgroundColor="whitesmoke"
        aria-label="delete"
        icon={<DeleteIcon />}
        fontSize="24px"
        onClick={() => {
          deletePost({ id });
        }}
      />
    </Flex>
  );
};
