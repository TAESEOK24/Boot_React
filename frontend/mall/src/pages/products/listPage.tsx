
import axios from "axios"
import {
  createSearchParams,
  useLoaderData
} from "react-router"

import type { LoaderFunctionArgs } from "react-router"

import ListComponent from "../../components/products/listComponent"

// 상품 목록 데이터를 가져오는 loader 함수
export async function loadProducts({ request }: LoaderFunctionArgs) {

  const url = new URL(request.url)

  const page = url.searchParams.get("page") || "1"
  const size = url.searchParams.get("size") || "10"

  const queryStr = createSearchParams({
    page,
    size
  }).toString()

  const res = await axios.get<PageResponseDTO<ProductDTO>>(
    `http://localhost:8080/api/products/list?${queryStr}`
  )

  return res.data
}

// 상품 목록 페이지
const ListPage = () => {

  // loader에서 가져온 상품 데이터
  const serverData = useLoaderData() as PageResponseDTO<ProductDTO>

  return (
    <div className="w-full mt-4 border border-solid border-neutral-300 bg-white">

      <div className="text-2xl m-4 font-extrabold">
        Products List Page
      </div>

      {/* 실제 상품 목록 출력 */}
      <ListComponent serverData={serverData} />

    </div>
  )
}

export default ListPage
