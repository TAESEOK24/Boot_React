
import useCustomMove from "../../hooks/useCustomMove"
import PageComponent from "../common/pageComponent"

interface ListComponentProps {
  serverData: PageResponseDTO<ProductDTO>
}

function ListComponent({ serverData }: ListComponentProps) {

  const { moveToRead, moveToList } = useCustomMove()

  return (
    <div className="border-2 border-blue-100 mt-10 mr-2 ml-2 text-2xl">

      {/* 상품 목록 */}
      <div className="flex flex-wrap mx-auto p-6 bg-white">

        {serverData.dtoList.map(product => (

          <div
            key={product.pno}
            className="w-full md:w-1/2 p-2 rounded shadow-md border-2 border-gray-200 cursor-pointer"
            onClick={() => moveToRead(product.pno)}
          >

            <div className="flex flex-col h-full">

              {/* 상품 번호 */}
              <div className="font-extrabold text-xl p-2 w-full">
                {product.pno}
              </div>

              {/* 상품 이미지 */}
              <div className="w-full overflow-hidden">

                {product.uploadFileNames?.length > 0 ? (
                  <img
                    alt={product.pname}
                    className="m-auto rounded-md w-2/3"
                    src={`http://localhost:8080/api/products/view/s_${product.uploadFileNames[0]}`}
                  />
                ) : (
                  <div className="text-center text-gray-400 text-base p-6">
                    No Image
                  </div>
                )}

              </div>

              {/* 상품명과 가격 */}
              <div className="bottom-0 font-extrabold bg-white">

                <div className="text-center p-1">
                  이름 : {product.pname}
                </div>

                <div className="text-center p-1">
                  가격 : {product.price}
                </div>

              </div>

            </div>
          </div>
        ))}

      </div>

      {/* 페이징 컴포넌트 */}
      <PageComponent
        serverData={serverData}
        movePage={moveToList}
      />

    </div>
  )
}

export default ListComponent
