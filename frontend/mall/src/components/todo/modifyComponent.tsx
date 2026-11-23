
import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"
import { getOne, putOne, deleteOne } from "../../api/todoApi"
import useCustomMove from "../../hooks/useCustomMove"
import ResultModal from "../common/resultModal"

const initState: Todo = {
  tno: 0,
  title: "",
  writer: "",
  dueDate: null,
  complete: false
}

const ModifyComponent = ({ tno }: { tno: number }) => {

  const [todo, setTodo] = useState<Todo>({ ...initState })

  // 수정 또는 삭제 결과를 저장
  const [result, setResult] = useState<string | null>(null)

  // 모달 종료 후 페이지 이동에 사용할 함수
  const { moveToList, moveToRead } = useCustomMove()

  // 기존 Todo 데이터 조회
  useEffect(() => {
    getOne(tno)
      .then(data => setTodo(data))
      .catch(error => console.error(error))
  }, [tno])

  // TITLE, DUEDATE 변경
  const handleChangeTodo = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setTodo(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  // COMPLETE 변경
  const handleChangeTodoComplete = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value

    setTodo(prevState => ({
      ...prevState,
      complete: value === "Y"
    }))
  }

  // Modify 버튼 클릭
  const handleClickModify = () => {
    const todoModify: TodoModify = {
      tno: todo.tno,
      title: todo.title,
      dueDate: todo.dueDate,
      complete: todo.complete
    }

    putOne(todoModify)
      .then(data => {
        console.log("modify result:", data)
        setResult("Modified")
      })
      .catch(error => console.error(error))
  }

  // Delete 버튼 클릭
  const handleClickDelete = () => {
    deleteOne(tno)
      .then(data => {
        console.log("delete result:", data)
        setResult("Deleted")
      })
      .catch(error => console.error(error))
  }

  // 결과 모달을 닫을 때 페이지 이동
  const closeModal = () => {
    setResult(null)

    if (result === "Deleted") {
      moveToList()
    } else {
      moveToRead(tno)
    }
  }

  return (
    <div className="border-2 border-sky-200 mt-10 m-2 p-4">

      {/* 수정/삭제 결과 모달 */}
      {result && (
        <ResultModal
          title="처리결과"
          content={result}
          callbackFn={closeModal}
        />
      )}

      {/* TNO */}
      <div className="flex justify-center mt-10">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">
            TNO
          </div>
          <div className="w-4/5 p-6 rounded-r border border-solid shadow-md bg-gray-100">
            {todo.tno}
          </div>
        </div>
      </div>

      {/* WRITER */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">
            WRITER
          </div>
          <div className="w-4/5 p-6 rounded-r border border-solid shadow-md bg-gray-100">
            {todo.writer}
          </div>
        </div>
      </div>

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
            value={todo.dueDate || ""}
            onChange={handleChangeTodo}
          />
        </div>
      </div>

      {/* COMPLETE */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">
            COMPLETE
          </div>
          <select
            name="status"
            className="border-solid border-2 rounded m-1 p-2"
            value={todo.complete ? "Y" : "N"}
            onChange={handleChangeTodoComplete}
          >
            <option value="Y">Completed</option>
            <option value="N">Not Yet</option>
          </select>
        </div>
      </div>

      {/* 수정 / 삭제 버튼 */}
      <div className="flex justify-end p-4">
        <button
          type="button"
          className="inline-block rounded p-4 m-2 text-xl w-32 text-white bg-red-500"
          onClick={handleClickDelete}
        >
          Delete
        </button>

        <button
          type="button"
          className="rounded p-4 m-2 text-xl w-32 text-white bg-blue-500"
          onClick={handleClickModify}
        >
          Modify
        </button>
      </div>

    </div>
  )
}

export default ModifyComponent
