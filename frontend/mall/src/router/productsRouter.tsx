
import { lazy, Suspense } from "react"
import { Navigate } from "react-router"

import { loadProducts } from "../pages/products/listPage"
import { loadProduct } from "../pages/products/readPage"

const ProductsIndex = lazy(() =>
  import("../pages/products/indexPage")
)

const ProductList = lazy(() =>
  import("../pages/products/listPage")
)

const ProductAdd = lazy(() =>
  import("../pages/products/addPage")
)

const ProductRead = lazy(() =>
  import("../pages/products/readPage")
)

const ProductModify = lazy(() =>
  import("../pages/products/modifyPage")
)

const Loading = () => <div>Products Loading....</div>

export default function productsRouter() {
  return {
    path: "products",
    Component: ProductsIndex,
    children: [
      {
        index: true,
        element: <Navigate to="list" replace />
      },
      {
        path: "list",
        loader: loadProducts,
        element: (
          <Suspense fallback={<Loading />}>
            <ProductList />
          </Suspense>
        )
      },
      {
        path: "add",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductAdd />
          </Suspense>
        )
      },
      {
        path: "read/:pno",
        loader: loadProduct,
        element: (
          <Suspense fallback={<Loading />}>
            <ProductRead />
          </Suspense>
        )
      },
      {
        path: "modify/:pno",
        loader: loadProduct,
        element: (
          <Suspense fallback={<Loading />}>
            <ProductModify />
          </Suspense>
        )
      }
    ]
  }
}
