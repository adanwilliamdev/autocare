from app.schemas.common import CamelModel


class MonthlyRevenue(CamelModel):
    month: str
    amount: float


class TopMechanic(CamelModel):
    mechanic_id: str
    mechanic_name: str
    completed_orders: int


class MostUsedPart(CamelModel):
    part_id: str
    part_name: str
    usage_count: int


class DashboardStats(CamelModel):
    total_clients: int
    total_vehicles: int
    total_service_orders: int
    open_service_orders: int
    in_progress_service_orders: int
    waiting_approval_service_orders: int
    monthly_revenue: float
    low_stock_items: int
    monthly_revenue_chart: list[MonthlyRevenue]
    top_mechanics: list[TopMechanic]
    most_used_parts: list[MostUsedPart]
