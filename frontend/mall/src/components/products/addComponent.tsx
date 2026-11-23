
import axios from "axios"
import { useActionState } from "react"
import PendingModal from "../common/pendingModal"
import ResultModal from "../common/resultModal"
import useCustomMove from "../../hooks/useCustomMove"

// 상품 등록 결과 타입
interface ProductAddResult {
  result?: number
  error?: string
}

// 초기 상태
const initState: ProductAddResult = {
  result: 0
}

// 상품 등록 API 요청
const addAsyncAction = async (
  _state: ProductAddResult,
  formData: FormData
): Promise<ProductAddResult> => {

  const pname = formData.get("pname") as string

  if (!pname || !pname.trim()) {
    return { error: "Insert Product Name" }
  }

  try {
    const res = await axios.post<{ RESULT: number }>(
      "http://localhost:8080/api/products/",
      formData
    )

    return { result: res.data.RESULT }

  } catch (error) {
    console.error(error)
    return { error: "상품 등록에 실패했습니다." }
  }
}

const AddComponent = () => {

  const [state, action, isPending] =
    useActionState(addAsyncAction, initState)

  // 목록 페이지 이동
  const { moveToList } = useCustomMove()

  // 결과 모달 닫기
  const closeModal = (): void => {
    moveToList()
  }

  return (
    <div className="border-2 border-sky-200 mt-10 m-2 p-4">

      {/* 처리 중 모달 */}
      {isPending && <PendingModal />}

      {/* 등록 완료 모달 */}
      {state.result !== 0 && state.result !== undefined && (
        <ResultModal
          title="상품 추가 결과"
          content={`새로운 ${state.result} 상품 추가됨`}
          callbackFn={closeModal}
        />
      )}

      {/* 오류 메시지 */}
      {state.error && (
        <div className="text-red-500">
          {state.error}
        </div>
      )}

      <form action={action}>

        {/* 상품명 */}
        <div className="flex justify-center">
          <div className="relative mb-4 flex w-full flex-wrap items-stretch">

            <div className="w-1/5 p-6 text-right font-bold">
              Product Name
            </div>

            <input
              className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
              name="pname"
              type="text"
              required
            />

          </div>
        </div>

        {/* 상품 설명 */}
        <div className="flex justify-center">
          <div className="relative mb-4 flex w-full flex-wrap items-stretch">

            <div className="w-1/5 p-6 text-right font-bold">
              Desc
            </div>

            <textarea
              className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md resize-y"
              name="pdesc"
              rows={4}
              required
            />

          </div>
        </div>

        {/* 상품 가격 */}
        <div className="flex justify-center">
          <div className="relative mb-4 flex w-full flex-wrap items-stretch">

            <div className="w-1/5 p-6 text-right font-bold">
              Price
            </div>

            <input
              className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
              name="price"
              type="number"
              min="0"
              required
            />

          </div>
        </div>

        {/* 이미지 업로드 */}
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

        {/* 등록 버튼 */}
        <div className="flex justify-end">
          <div className="relative mb-4 flex p-4 flex-wrap items-stretch">

            <button
              type="submit"
              disabled={isPending}
              className="rounded p-4 m-2 w-36 bg-blue-500 text-xl text-white disabled:opacity-50"
            >
              ADD
            </button>

          </div>
        </div>

      </form>
    </div>
  )
}

export default AddComponent
