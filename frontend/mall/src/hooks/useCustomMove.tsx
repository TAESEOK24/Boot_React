import { createSearchParams, useNavigate, useSearchParams } from "react-router"
import { useCallback } from "react"

const useCustomMove = (): UseCustomMoveReturn => {
  const navigate = useNavigate()
  const [queryParams] = useSearchParams()

  const pageStr = queryParams.get("page")
  const sizeStr = queryParams.get("size")

  const page = pageStr ? Number(pageStr) : 1
  const size = sizeStr ? Number(sizeStr) : 10

  const queryDefault = createSearchParams({
    page: String(page),
    size: String(size),
  }).toString()

  const moveToList = (pageParam?: PageParam) => {
    let queryStr = queryDefault

    if (pageParam) {
      const pageNum = Number(pageParam.page) || 1
      const sizeNum = Number(pageParam.size) || 10

      queryStr = createSearchParams({
        page: String(pageNum),
        size: String(sizeNum),  
      }).toString()
    }

    navigate({ pathname: "../list", search: queryStr })
  }

  const moveToModify = useCallback(
  (tno: number) => {
    navigate({
      pathname: `../modify/${tno}`,
      search: queryDefault,
    })
  },
  [navigate, queryDefault],
)

const moveToRead = (tno: number) => {
  navigate({
    pathname: `../read/${tno}`,
    search: queryDefault,
  })
}

return { page, size, moveToList, moveToModify, moveToRead }
}
export default useCustomMove