import React from "react";
import { Table } from "antd";
import Loading from "../../../LoadingComponent/Loading";

const TableUser = ({
    columns = [],
    data = [],
    isLoading = false,
    selectionType = "radio",
    setRowSelected, // mở lại prop nếu cần
    onRow,
}) => {
    const rowSelection = setRowSelected
        ? {
              type: selectionType,
              onChange: (selectedRowKeys, selectedRows) => {
                  if (selectedRowKeys.length > 0) {
                      setRowSelected(selectedRowKeys[0]);
                  }
              },
          }
        : null;

    return (
        <Loading isPending={isLoading}>
            <Table
                {...(rowSelection ? { rowSelection } : {})}
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 5 }}
                onRow={onRow}
                rowKey="_id"
                bordered
            />
        </Loading>
    );
};

export default TableUser;

