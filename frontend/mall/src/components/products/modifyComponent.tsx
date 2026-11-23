
import { useActionState, useState } from "react"
import type { MouseEvent } from "react"
import useCustomMove from "../../hooks/useCustomMove"
import axios from "axios"
import PendingModal from "../common/pendingModal"
import ResultModal from "../common/resultModal"

// 수정/삭제 결과 타입
interface ProductTaskResult {
  actionType: string
  result: string
  error?: string
}

// 초기 상태
const initState: ProductTaskResult = {
  actionType: "modify",
  result: ""
}

// 수정/삭제 API 요청
const modifyDeleteAsyncAction = async (
  _state: ProductTaskResult,
  formData: FormData
): Promise<ProductTaskResult> => {

  const pno = formData.get("pno")
  const actionType = formData.get("actionType") as string

  try {
    let res

    if (actionType === "modify") {

      res = await axios.put(
        `http://localhost:8080/api/products/${pno}`,
        formData
      )

    } else if (actionType === "delete") {

      res = await axios.delete(
        `http://localhost:8080/api/products/${pno}`
      )

    } else {
      return {
        actionType,
        result: "",
        error: "잘못된 요청입니다."
      }
    }

    return {
      actionType,
      result: res.data.RESULT
    }

  } catch (error) {
    console.error(error)

    return {
      actionType,
      result: "",
      error: "처리 중 오류가 발생했습니다."
    }
  }
}

// 상품 수정 컴포넌트
function ModifyComponent({ product }: { product: ProductDTO }) {

  const { moveToRead, moveToList } = useCustomMove()

  // 기존 이미지 목록
  const [images, setImages] = useState<string[]>(
    [...(product.uploadFileNames ?? [])]
  )

  // 기존 이미지 삭제 처리
  const deleteOldImages = (
    event: MouseEvent<HTMLButtonElement>,
    target: string
  ) => {

    event.preventDefault()
    event.stopPropagation()

    setImages(prev =>
      prev.filter(img => img !== target)
    )
  }

  const [state, action, isPending] = useActionState(
    modifyDeleteAsyncAction,
    initState
  )

  // 결과 모달 종료
  const closeModal = () => {

    if (state.actionType === "modify") {
      moveToRead(product.pno)
    }

    if (state.actionType === "delete") {
      moveToList()
    }
  }

  return (
    <div className="border-2 border-sky-200 mt-10 m-2 p-4 bg-white">

      {/* 처리 중 모달 */}
      {isPending && <PendingModal />}

      {/* 처리 결과 모달 */}
      {state.result && (
        <ResultModal
          title="처리결과"
          content={`${state.actionType} 처리 완료`}
          callbackFn={closeModal}
        />
      )}

      {/* 에러 메시지 */}
      {state.error && (
        <div className="text-red-500 p-4">
          {state.error}
        </div>
      )}

      <form action={action}>

        {/* PNO */}
        <div className="flex justify-center">
          <div className="relative mb-4 flex w-full flex-wrap items-stretch">

            <div className="w-1/5 p-6 text-right font-bold">
              PNO
            </div>

            <input
              className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md bg-gray-100"
              name="pno"
              type="number"
              readOnly
              defaultValue={product.pno}
            />

          </div>
        </div>

        {/* PNAME */}
        <div className="flex justify-center">
          <div className="relative mb-4 flex w-full flex-wrap items-stretch">

            <div className="w-1/5 p-6 text-right font-bold">
              PNAME
            </div>

            <input
              className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
              name="pname"
              type="text"
              required
              defaultValue={product.pname}
            />

          </div>
        </div>

        {/* PRICE */}
        <div className="flex justify-center">
          <div className="relative mb-4 flex w-full flex-wrap items-stretch">

            <div className="w-1/5 p-6 text-right font-bold">
              PRICE
            </div>

            <input
              className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
              name="price"
              type="number"
              required
              defaultValue={product.price}
            />

          </div>
        </div>

        {/* PDESC */}
        <div className="flex justify-center">
          <div className="relative mb-4 flex w-full flex-wrap items-stretch">

            <div className="w-1/5 p-6 text-right font-bold">
              PDESC
            </div>

            <textarea
              className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md resize-y"
              name="pdesc"
              rows={4}
              required
              defaultValue={product.pdesc}
            />

          </div>
        </div>

        {/* 새로운 이미지 업로드 */}
        <div className="flex justify-center">
          <div className="relative mb-4 flex w-full flex-wrap items-stretch">

            <div className="w-1/5 p-6 text-right font-bold">
              Files
            </div>

            <input
              className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
              type="file"
              name="files"
              accept="image/*"
              multiple
            />

          </div>
        </div>

        {/* 기존 이미지 출력 및 삭제 */}
        <div className="w-full justify-center flex flex-col m-auto items-center">

          {images.map((imgFile, i) => (

            <div
              key={imgFile}
              className="flex justify-center flex-col items-center m-2"
            >

              <img
                alt={`product-${i}`}
                className="w-40 p-2"
                src={`http://localhost:8080/api/products/view/${encodeURIComponent(imgFile)}`}
              />

              {/* 유지할 기존 이미지 파일명 전송 */}
              <input
                type="hidden"
                name="uploadFileNames"
                value={imgFile}
              />

              <button
                type="button"
                className="bg-red-500 text-white rounded p-2 m-2"
                onClick={(event) =>
                  deleteOldImages(event, imgFile)
                }
              >
                X
              </button>

            </div>
          ))}

        </div>

        {/* 수정 및 삭제 버튼 */}
        <div className="flex justify-end p-4">

          <button
            type="submit"
            name="actionType"
            value="modify"
            disabled={isPending}
            className="rounded p-4 m-2 text-xl w-32 text-white bg-red-500 disabled:opacity-50"
          >
            Modify
          </button>

          <button
            type="submit"
            name="actionType"
            value="delete"
            disabled={isPending}
            className="rounded p-4 m-2 text-xl w-32 text-white bg-blue-500 disabled:opacity-50"
          >
            Delete
          </button>

        </div>

      </form>
    </div>
  )
}

export default ModifyComponent
