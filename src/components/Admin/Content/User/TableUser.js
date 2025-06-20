import React from "react";
import { Table } from "antd";
import Loading from "../../../LoadingComponent/Loading";

const TableUser = ({
    columns = [],
    data = [],
    isLoading = false,
    selectionType = "radio",
    setRowSelected,
    onRow,
}) => {
    const rowSelection = {
        type: selectionType,
        onChange: (selectedRowKeys, selectedRows) => {
            if (setRowSelected && selectedRowKeys.length > 0) {
                setRowSelected(selectedRowKeys[0]); // Chọn 1 dòng
            }
        },
    };

    return (
        <Loading isPending={isLoading}>
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 5 }}
                onRow={onRow}
                rowKey="_id" // Đảm bảo _id được sử dụng làm key
                bordered
            />
        </Loading>
    );
};

export default TableUser;
