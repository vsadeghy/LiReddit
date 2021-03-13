import { Box, Flex, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { useMeQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post = ({}) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();
  const [{ data: meData }] = useMeQuery();
  return (
    <Layout>
      {error ? (
        <div>{error.message}</div>
      ) : fetching ? (
        <div>loading...</div>
      ) : !data?.post ? (
        <Box>counld not find post</Box>
      ) : (
        <Flex align="center">
          <Box>
            <Heading mb={4}>{data.post.title}</Heading>
            {data.post.text}
          </Box>
          {meData?.me?.id !== data.post.creator.id ? null : (
            <Box ml="auto">
              <EditDeletePostButtons id={data.post.creator.id} />
            </Box>
          )}
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
