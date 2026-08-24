 /**
  * Request Validation Middleware
  *
  * Supports schema validators that expose
  * a validate() method.
  */

function validateWithSchema(
  schema,
  data
) {
  if (
    !schema ||
    typeof schema.validate !==
      'function'
  ) {
    throw new Error(
      'Invalid validation schema. Expected a schema with a validate() method.'
    );
  }

  return schema.validate(
    data,
    {
      abortEarly: false,
      stripUnknown: true
    }
  );
}

/**
 * Validate request body.
 */
export function validateRequestBody(
  schema
) {
  return (
    req,
    res,
    next
  ) => {
    try {
      const {
        error,
        value
      } =
        validateWithSchema(
          schema,
          req.body
        );

      if (error) {
        const details =
          Array.isArray(
            error.details
          )
            ? error.details.map(
                (detail) => ({
                  field:
                    Array.isArray(
                      detail.path
                    )
                      ? detail.path.join(
                          '.'
                        )
                      : String(
                          detail.path ||
                            'body'
                        ),

                  message:
                    detail.message ||
                    'Invalid value'
                })
              )
            : [];

        return res
          .status(400)
          .json({
            error:
              'Validation Error',

            message:
              'Invalid request body',

            details
          });
      }

      req.body = value;

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/**
 * Validate query parameters.
 */
export function validateQueryParams(
  schema
) {
  return (
    req,
    res,
    next
  ) => {
    try {
      const {
        error,
        value
      } =
        validateWithSchema(
          schema,
          req.query
        );

      if (error) {
        const details =
          Array.isArray(
            error.details
          )
            ? error.details.map(
                (detail) => ({
                  field:
                    Array.isArray(
                      detail.path
                    )
                      ? detail.path.join(
                          '.'
                        )
                      : String(
                          detail.path ||
                            'query'
                        ),

                  message:
                    detail.message ||
                    'Invalid value'
                })
              )
            : [];

        return res
          .status(400)
          .json({
            error:
              'Validation Error',

            message:
              'Invalid query parameters',

            details
          });
      }

      req.query = value;

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/**
 * Validate route parameters.
 */
export function validateParams(
  schema
) {
  return (
    req,
    res,
    next
  ) => {
    try {
      const {
        error,
        value
      } =
        validateWithSchema(
          schema,
          req.params
        );

      if (error) {
        const details =
          Array.isArray(
            error.details
          )
            ? error.details.map(
                (detail) => ({
                  field:
                    Array.isArray(
                      detail.path
                    )
                      ? detail.path.join(
                          '.'
                        )
                      : String(
                          detail.path ||
                            'params'
                        ),

                  message:
                    detail.message ||
                    'Invalid value'
                })
              )
            : [];

        return res
          .status(400)
          .json({
            error:
              'Validation Error',

            message:
              'Invalid URL parameters',

            details
          });
      }

      req.params = value;

      return next();
    } catch (error) {
      return next(error);
    }
  };
}