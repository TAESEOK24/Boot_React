
const ResultModal = ({
  title,
  content,
  callbackFn
}: ResultModal) => {

  return (
    <div
      className="fixed inset-0 z-[1055] flex h-full w-full items-center justify-center bg-black/70"
      onClick={() => {
        if (callbackFn) {
          callbackFn()
        }
      }}
    >
      <div
        className="w-1/4 min-w-[300px] rounded bg-white px-6 pb-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="mt-6 mb-6 border-b-4 border-gray-500 bg-amber-400 text-center text-2xl">
          {title}
        </div>

        <div className="border-b-4 border-orange-400 p-4 text-center text-2xl">
          {content}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="mt-4 rounded bg-blue-500 px-6 py-4 text-lg text-white"
            onClick={() => {
              if (callbackFn) {
                callbackFn()
              }
            }}
          >
            Close Modal
          </button>
        </div>

      </div>
    </div>
  )
}

export default ResultModal
