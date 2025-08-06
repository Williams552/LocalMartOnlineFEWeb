import React from 'react';
import ModalComponent from './ModalComponent';

const TermsOfServiceModal = ({ isOpen, onClose }) => {
    return (
        <ModalComponent
            title="Điều khoản sử dụng LocalMart"
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
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Chấp nhận điều khoản</h3>
                        <p className="text-sm leading-relaxed">
                            Khi sử dụng nền tảng LocalMart, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện này.
                            Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không được sử dụng dịch vụ của chúng tôi.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Mô tả dịch vụ</h3>
                        <p className="text-sm leading-relaxed">
                            LocalMart là nền tảng thương mại điện tử kết nối người mua và người bán nông sản địa phương.
                            Chúng tôi cung cấp không gian để các bên tương tác, giao dịch và trao đổi thông tin về sản phẩm nông nghiệp.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Đăng ký tài khoản</h3>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li>• Bạn phải cung cấp thông tin chính xác, đầy đủ khi đăng ký</li>
                            <li>• Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình</li>
                            <li>• Mỗi người chỉ được tạo một tài khoản duy nhất</li>
                            <li>• Bạn phải từ 18 tuổi trở lên để đăng ký tài khoản</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Quy định về người bán</h3>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li>• Đảm bảo chất lượng và nguồn gốc sản phẩm</li>
                            <li>• Cung cấp thông tin sản phẩm chính xác, không gian lận</li>
                            <li>• Tuân thủ các quy định về an toàn thực phẩm</li>
                            <li>• Giao hàng đúng thời gian đã cam kết</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Quy định về người mua</h3>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li>• Thanh toán đầy đủ, đúng hạn theo thỏa thuận</li>
                            <li>• Kiểm tra kỹ sản phẩm khi nhận hàng</li>
                            <li>• Báo cáo kịp thời nếu có vấn đề về chất lượng</li>
                            <li>• Tôn trọng và có thái độ lịch sự với người bán</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Thanh toán và phí dịch vụ</h3>
                        <p className="text-sm leading-relaxed">
                            LocalMart có thể thu phí dịch vụ từ các giao dịch thành công. Mọi khoản phí sẽ được thông báo rõ ràng trước khi thực hiện giao dịch.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Bảo vệ thông tin cá nhân</h3>
                        <p className="text-sm leading-relaxed">
                            Chúng tôi cam kết bảo vệ thông tin cá nhân của người dùng theo chính sách bảo mật đã công bố.
                            Thông tin sẽ chỉ được sử dụng cho mục đích cung cấp dịch vụ và cải thiện trải nghiệm người dùng.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">8. Hành vi bị cấm</h3>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li>• Đăng bán sản phẩm giả, kém chất lượng</li>
                            <li>• Sử dụng ngôn ngữ không phù hợp, xúc phạm</li>
                            <li>• Spam, quảng cáo không liên quan</li>
                            <li>• Tạo nhiều tài khoản ảo để thao túng đánh giá</li>
                            <li>• Vi phạm pháp luật Việt Nam</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">9. Xử lý tranh chấp</h3>
                        <p className="text-sm leading-relaxed">
                            LocalMart sẽ hỗ trợ hòa giải các tranh chấp giữa người mua và người bán.
                            Trong trường hợp không thể giải quyết, các bên có thể tìm đến cơ quan pháp luật có thẩm quyền.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">10. Thay đổi điều khoản</h3>
                        <p className="text-sm leading-relaxed">
                            LocalMart có quyền thay đổi các điều khoản này bất kỳ lúc nào. Các thay đổi sẽ được thông báo trước ít nhất 7 ngày
                            và có hiệu lực khi được đăng tải trên website.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">11. Liên hệ</h3>
                        <p className="text-sm leading-relaxed">
                            Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua:
                        </p>
                        <ul className="text-sm leading-relaxed mt-2 space-y-1">
                            <li>• Email: support@localmart.com</li>
                            <li>• Hotline: 1900-xxxx</li>
                            <li>• Địa chỉ: [Địa chỉ công ty]</li>
                        </ul>
                    </section>

                    <div className="border-t pt-4 mt-6">
                        <p className="text-xs text-gray-500 text-center">
                            Điều khoản có hiệu lực từ ngày 01/01/2025
                            <br />
                            Phiên bản 1.0 - Cập nhật lần cuối: 05/08/2025
                        </p>
                    </div>
                </div>
            </div>
        </ModalComponent>
    );
};

export default TermsOfServiceModal;
