import { gql } from "graphql-tag";

export const OrderDetailsFragment = gql`
  fragment OrderDetailsFragment on Order {
    id
    number
    userEmail
    billingAddress {
      firstName
      lastName
      streetAddress1
      streetAddress2
      city
      postalCode
      country {
        code
      }
    }
    shippingAddress {
      firstName
      lastName
      streetAddress1
      streetAddress2
      city
      postalCode
      country {
        code
      }
    }
    total {
      gross {
        amount
        currency
      }
      net {
        amount
      }
      tax {
        amount
      }
    }
    lines {
      id
      productName
      variantName
      quantity
      unitPrice {
        gross {
          amount
        }
        net {
          amount
        }
      }
      totalPrice {
        gross {
          amount
        }
        net {
          amount
        }
      }
      variant {
        product {
          attributes {
            attribute {
              id
              name
            }
            values {
              id
              name
              slug
            }
          }
        }
      }
    }
  }
`;

export const OrderDetailsQuery = gql`
  ${OrderDetailsFragment}
  query OrderDetails($id: ID!) {
    order(id: $id) {
      ...OrderDetailsFragment
    }
  }
`;
