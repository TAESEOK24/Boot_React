
import { useCallback, useState } from "react"
import {
  createSearchParams,
  useNavigate,
  useSearchParams
} from "react-router"

const useCustomMove = (): UseCustomMoveReturn => {
  const navigate = useNavigate()
  const [queryParams] = useSearchParams()

  // refresh 상태 추가
  const [refresh, setRefresh] = useState<boolean>(false)

  const pageStr = queryParams.get("page")
  const sizeStr = queryParams.get("size")

  const page = pageStr ? Number(pageStr) : 1
  const size = sizeStr ? Number(sizeStr) : 10

  const queryDefault = createSearchParams({
    page: String(page),
    size: String(size),
  }).toString()

  const moveToList = (pageParam?: PageParam) => {
    let queryStr = ""

    if (pageParam) {
      const pageNum = Number(pageParam.page) || 1
      const sizeNum = Number(pageParam.size) || 10

      queryStr = createSearchParams({
        page: String(pageNum),
        size: String(sizeNum),
      }).toString()

      // 동일한 페이지를 다시 클릭할 경우
      if (queryStr === queryDefault) {
        setRefresh(prev => !prev)
      }
    } else {
      queryStr = queryDefault
    }

    navigate({
      pathname: "../list",
      search: queryStr
    })
  }

  const moveToModify = useCallback(
    (tno: number) => {
      navigate({
        pathname: `../modify/${tno}`,
        search: queryDefault,
      })
    },
    [navigate, queryDefault]
  )

    const moveToRead = (num:number) => {
console.log(queryDefault)
navigate({
pathname: `../read/${num}`,
search: queryDefault
})
}

return {moveToList, moveToModify, moveToRead, page, size, refresh} //moveToRead added

}

export default useCustomMove
