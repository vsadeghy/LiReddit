import { Box, Box as Link, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface loginProps {}

const Login: React.FC<{}> = ({}) => {
  const [complete, setcomplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setcomplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>if an account with ehat email exist, we sent you an email</Box>
          ) : (
            <Form>
              <Link mt="4">
                <InputField
                  name="email"
                  placeholder="email"
                  label="email"
                  type="email"
                />
              </Link>
              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                colorScheme="teal"
              >
                forgot password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
