import { EmptyState } from "../components/ui";

export default function ReviewsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Reviews</h2>
      <EmptyState
        title="Reviews are not connected yet"
        body="There is no reviews table or request-review API in this application. This page is ready to show customer, rating, review, date, and response status when that data exists."
      />
    </div>
  );
}

export function MessagesPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Messages</h2>
      <EmptyState
        title="Inbox is not connected yet"
        body="Customer SMS and email are sent from booking events. There is no message thread store to display here yet."
      />
    </div>
  );
}
