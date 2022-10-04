import {Table, Skeleton} from "@mantine/core"

const skeletonWidth = "100%"
const skeletonHeight = "5rem"

export const LightsTableSkeleton = () => {
    const skeleton = (
        <td>
            Loading...
            <Skeleton width={skeletonWidth} height={skeletonHeight}/>
        </td>
    )
    const skeletonArrayLength = 4
    const skeletonArray = [...Array(skeletonArrayLength)].map((element) => skeleton)
    return (
        <Table sx={{ maxWidth: '1000px' }}
               verticalSpacing="xs"
               striped={true}
               horizontalSpacing="xs"
               highlightOnHover={true}
               className="table-lights-status">
            <thead>
            <tr>
                <th>Light Location</th>
                <th>Model</th>
                <th>Status</th>
                <th>Color and Brightness</th>
            </tr>
            </thead>
            <tbody>
                <tr>
                    {skeletonArray}
                </tr>
                <tr>
                    {skeletonArray}
                </tr>
                <tr>
                    {skeletonArray}
                </tr>
                <tr>
                    {skeletonArray}
                </tr>
            </tbody>
        </Table>
    )
}