interface PageParam {
page?: string | number
size?: string | number
}

interface UseCustomMoveReturn {
  moveToList: (pageParam?: PageParam) => void
  page: number
  size: number
  moveToModify: (tno: number) => void
    moveToRead: (tno: number) => void
}

interface PageRequestDTO {
page:number,
size: number
}
interface PageResponseDTO<T> {
dtoList: T[] 
pageNumList: number[] 
prev: boolean 
next: boolean 
totalCount: number 
prevPage: number 
nextPage: number 
totalPage: number 
// Generic array
// Array of numbers
pageRequestDTO : PageRequestDTO | null // Assuming it's an object or null
// Boolean indicating if there is a previous page
// Boolean indicating if there is a next page
// Total count of items
// Previous page number
// Next page number
// Total number of pages
current: number // Current page number
}