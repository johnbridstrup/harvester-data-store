import { useEffect, useState } from "react";
import { openapiSchema } from "features/base/service";

function useOpenApi(token) {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await openapiSchema(token);
        setLoading(false);
        setSchema((current) => res.components?.schemas);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    })();
  }, [token]);

  return { schema, loading };
}

export default useOpenApi;
