import React from 'react';
import ModalComponent from './ModalComponent';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
    return (
        <ModalComponent
            title="Chính sách bảo mật LocalMart"
            isOpen={isOpen}
            isCancel={onClose}
            width={800}
            footer={[
                <button
                    key="close"
                    onClick={onClose}
                    className="px-6 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition duration-200"
                >
                    Đóng
                </button>
            ]}
        >
            <div className="max-h-96 overflow-y-auto p-4">
                <div className="space-y-6 text-gray-700">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Cam kết bảo mật</h3>
                        <p className="text-sm leading-relaxed">
                            LocalMart cam kết bảo vệ thông tin cá nhân của bạn và tuân thủ nghiêm ngặt các quy định về bảo vệ dữ liệu cá nhân.
                            Chúng tôi sử dụng các biện pháp bảo mật tiên tiến để đảm bảo thông tin của bạn được an toàn.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Thông tin chúng tôi thu thập</h3>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li>• <strong>Thông tin đăng ký:</strong> Họ tên, email, số điện thoại, địa chỉ</li>
                            <li>• <strong>Thông tin giao dịch:</strong> Lịch sử mua bán, phương thức thanh toán</li>
                            <li>• <strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại thiết bị, trình duyệt</li>
                            <li>• <strong>Thông tin hành vi:</strong> Lịch sử duyệt web, sở thích mua sắm</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Mục đích sử dụng thông tin</h3>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li>• Cung cấp và cải thiện dịch vụ</li>
                            <li>• Xử lý giao dịch và thanh toán</li>
                            <li>• Gửi thông báo về đơn hàng và khuyến mãi</li>
                            <li>• Hỗ trợ khách hàng và giải quyết tranh chấp</li>
                            <li>• Phân tích và cải thiện trải nghiệm người dùng</li>
                            <li>• Tuân thủ các yêu cầu pháp lý</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Chia sẻ thông tin</h3>
                        <p className="text-sm leading-relaxed mb-3">
                            Chúng tôi không bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn với bên thứ ba, trừ các trường hợp sau:
                        </p>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li>• Với sự đồng ý rõ ràng của bạn</li>
                            <li>• Với các đối tác dịch vụ (vận chuyển, thanh toán) để hoàn thành giao dịch</li>
                            <li>• Khi được yêu cầu bởi cơ quan pháp luật có thẩm quyền</li>
                            <li>• Để bảo vệ quyền lợi và an toàn của LocalMart và người dùng</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Bảo mật thông tin</h3>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li>• Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải</li>
                            <li>• Hệ thống tường lửa và phần mềm chống virus hiện đại</li>
                            <li>• Kiểm soát truy cập nghiêm ngặt đối với nhân viên</li>
                            <li>• Sao lưu dữ liệu định kỳ và khôi phục thảm họa</li>
                            <li>• Giám sát và ghi log hoạt động hệ thống 24/7</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Cookies và công nghệ theo dõi</h3>
                        <p className="text-sm leading-relaxed">
                            Chúng tôi sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm của bạn, phân tích lưu lượng truy cập
                            và cá nhân hóa nội dung. Bạn có thể kiểm soát cookies thông qua cài đặt trình duyệt của mình.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Quyền của người dùng</h3>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li>• <strong>Quyền truy cập:</strong> Xem thông tin cá nhân được lưu trữ</li>
                            <li>• <strong>Quyền chỉnh sửa:</strong> Cập nhật hoặc sửa đổi thông tin cá nhân</li>
                            <li>• <strong>Quyền xóa:</strong> Yêu cầu xóa thông tin cá nhân</li>
                            <li>• <strong>Quyền hạn chế:</strong> Giới hạn việc xử lý thông tin</li>
                            <li>• <strong>Quyền di chuyển:</strong> Chuyển thông tin sang nhà cung cấp khác</li>
                            <li>• <strong>Quyền từ chối:</strong> Không đồng ý với việc xử lý thông tin</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">8. Lưu trữ thông tin</h3>
                        <p className="text-sm leading-relaxed">
                            Thông tin cá nhân của bạn sẽ được lưu trữ trong thời gian cần thiết để cung cấp dịch vụ hoặc theo yêu cầu pháp lý.
                            Sau khi hết thời hạn, chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin của bạn.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">9. Trẻ em dưới 18 tuổi</h3>
                        <p className="text-sm leading-relaxed">
                            Dịch vụ của chúng tôi không dành cho trẻ em dưới 18 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân
                            từ trẻ em dưới 18 tuổi. Nếu phát hiện, chúng tôi sẽ xóa thông tin đó ngay lập tức.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">10. Cập nhật chính sách</h3>
                        <p className="text-sm leading-relaxed">
                            Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi quan trọng sẽ được thông báo
                            qua email hoặc thông báo trên website ít nhất 7 ngày trước khi có hiệu lực.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">11. Liên hệ về bảo mật</h3>
                        <p className="text-sm leading-relaxed mb-2">
                            Nếu bạn có câu hỏi về chính sách bảo mật hoặc muốn thực hiện quyền của mình, vui lòng liên hệ:
                        </p>
                        <ul className="text-sm leading-relaxed space-y-1">
                            <li>• Email: privacy@localmart.com</li>
                            <li>• Hotline: 1900-xxxx</li>
                            <li>• Địa chỉ: [Địa chỉ công ty]</li>
                        </ul>
                    </section>

                    <div className="border-t pt-4 mt-6">
                        <p className="text-xs text-gray-500 text-center">
                            Chính sách có hiệu lực từ ngày 01/01/2025
                            <br />
                            Phiên bản 1.0 - Cập nhật lần cuối: 05/08/2025
                        </p>
                    </div>
                </div>
            </div>
        </ModalComponent>
    );
};

export default PrivacyPolicyModal;
