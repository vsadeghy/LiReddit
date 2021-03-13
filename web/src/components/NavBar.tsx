import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  if (fetching) {
    // data is loading
    body = null;
  } else if (!data?.me) {
    // user not logged in
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4} bgColor="whitesmoke">
            create post
          </Button>
        </NextLink>
        <Flex direction="column" align="center">
          <Box mr={2}>{data.me.username}</Box>
          <Button
            onClick={() => {
              logout();
            }}
            isLoading={logoutFetching}
            variant="link"
          >
            logout
          </Button>
        </Flex>
      </Flex>
    );
    // user is logged in
  }
  return (
    <Flex position="sticky" top="0" zIndex="1" bg="tomato" p={4}>
      <Flex flex={1} m="auto" maxW={800} align="center">
        <NextLink href="/">
          <Link>
            <Heading>Lireddit</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
