import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReservationState } from "../types/Reservation";
import Header from "../components/Header/Header";
import ReservationCard from '../components/ReservationCard/ReservationCard';
import Toast from "../components/Toast/Toast";
import "../styles/MyReservation.styles.css";
import { getUserIdFromToken } from '../utils/auth';
import { apiRequest } from '../utils/api';

const MyReservation: React.FC = () => {
    const userId = getUserIdFromToken();
    const navigate = useNavigate();
    const location = useLocation();

    const [myReservations, setMyReservations] = useState<ReservationState[]>([]);
    const [scheduledTab, setScheduledTab] = useState<"scheduled" | "completed">("scheduled");
    const [showToast, setShowToast] = useState(location.state?.showToast || false);

    useEffect(() => {
        if (!userId) return;

        const fetchReservations = async () => {
            try {
                const response = await apiRequest(`/api/consulting/user/${userId}`);
                if (!response) return;

                console.log("원본 데이터: ", response);

                const formattedReservations = response.map((reservation: any) => ({
                    id: reservation.id,
                    designerId: reservation.designer.id,
                    designerName: reservation.designer.name,
                    profileImage: reservation.designer.profile,
                    time: reservation.time,
                    meetLink: reservation.meeting?.meetUrl || null,
                    type: reservation.type,
                    status: reservation.status,
                    paymentAmount: reservation.paymentAmount,
                    paymentMethod: reservation.paymentMethod
                }));

                console.log("포맷팅된 예약 데이터: ", formattedReservations);

                // 예약 상태에 따라서 filter
                const filteredReservations = myReservations.filter((res) => {
                    if (scheduledTab === "scheduled") return res.status === "FREE" || res.status === "SCHEDULED";
                    return res.status === "CANCELED" || res.status === "COMPLETED";
                });

                // 최신 순 정렬
                const sortedMyReservations = [...filteredReservations].sort((a, b) => {
                    return new Date(b.time).getTime() - new Date(a.time).getTime();
                });

                setMyReservations(sortedMyReservations);

            } catch (error) {
                console.error("내 예약 목록을 불러오는 데 실패했습니다.", error);
            }
        };

        fetchReservations();
    }, [userId]);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleSearchDesigners = () => {
        navigate('/designerlist');
    };

    return (
        <div className="my-reservation-container">
            <Header title="내 예약" />
            <div className="my-reservation-tabs">
                <button
                    className={`tab ${scheduledTab === "scheduled" ? "active" : ""}`}
                    onClick={() => setScheduledTab("scheduled")}
                > 진행 예정
                </button>
                <button
                    className={`tab ${scheduledTab === "completed" ? "active" : ""}`}
                    onClick={() => setScheduledTab("completed")}
                > 완료
                </button>
            </div>
            {myReservations.length > 0 ? (
                <div className="my-reservation-list">
                    {myReservations.map((res) => (
                        <ReservationCard key={res.id} reservation={res} />
                    ))}
                </div>
            ) : (
                <div className="myreservation-empty-state">
                    <p className="empty-state-title">내 예약이 없어요!</p>
                    <p className="empty-state-subtitle">디자이너를 찾아볼까요?</p>
                    <button onClick={handleSearchDesigners} className="retry-button">
                        디자이너 검색하기
                    </button>
                    <img src="/icons/reservation-logo.svg" alt="logo" className="myreservation-logo" />
                </div>
            )}
            {showToast && <Toast message="예약이 취소되었습니다." isVisible={showToast} onClose={() => setShowToast(false)} />}
        </div>
    );
};

export default MyReservation;