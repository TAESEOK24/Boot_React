
import { useState } from "react"
import type { ChangeEvent } from "react"
import { postAdd } from "../../api/todoApi"
import useCustomMove from "../../hooks/useCustomMove"
import ResultModal from "../common/resultModal"

const initState: TodoAdd = {
  title: "",
  writer: "",
  dueDate: ""
}

function AddComponent() {

  const [todo, setTodo] = useState<TodoAdd>({ ...initState })

  // 등록 결과 저장
  const [result, setResult] = useState<number | null>(null)

  // 목록으로 이동하는 함수
  const { moveToList }: UseCustomMoveReturn = useCustomMove()

  // 입력값 변경 처리
  const handleChangeTodo = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setTodo(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  // ADD 버튼 클릭 처리
  const handleClickAdd = (): void => {
    postAdd(todo)
      .then(result => {
        console.log(result)

        // 서버에서 전달받은 TNO 저장
        setResult(result.TNO)

        // 입력값 초기화
        setTodo({ ...initState })
      })
      .catch(e => {
        console.error(e)
      })
  }

  // 모달 닫기
  const closeModal = (): void => {
    setResult(null)
    moveToList()
  }

  return (
    <div className="border-2 border-sky-200 mt-10 m-2 p-4">

      {/* 등록 완료 모달 */}
      {result !== null && (
        <ResultModal
          title="Add Result"
          content={`New ${result} Added`}
          callbackFn={closeModal}
        />
      )}

      {/* TITLE */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">
            TITLE
          </div>

          <input
            className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
            name="title"
            type="text"
            value={todo.title}
            onChange={handleChangeTodo}
          />
        </div>
      </div>

      {/* WRITER */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">
            WRITER
          </div>

          <input
            className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
            name="writer"
            type="text"
            value={todo.writer}
            onChange={handleChangeTodo}
          />
        </div>
      </div>

      {/* DUEDATE */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">
            DUEDATE
          </div>

          <input
            className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
            name="dueDate"
            type="date"
            value={todo.dueDate}
            onChange={handleChangeTodo}
          />
        </div>
      </div>

      {/* ADD 버튼 */}
      <div className="flex justify-end">
        <div className="relative mb-4 flex flex-wrap items-stretch p-4">
          <button
            type="button"
            className="rounded p-4 m-2 w-36 bg-blue-500 text-xl text-white"
            onClick={handleClickAdd}
          >
            ADD
          </button>
        </div>
      </div>

    </div>
  )
}

export default AddComponent
