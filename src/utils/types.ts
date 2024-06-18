interface Data<T> {
    data: T;
}

export interface Pagination<T> extends Data<T> {
    success: boolean;
    total: number;
    per_page: number;
    data: T;
    has_next: boolean;
    has_prev: boolean;
    total_pages: number;
    current_page: number;
}
