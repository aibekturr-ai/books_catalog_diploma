import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import {
  fetchAdminStats,
  fetchPendingBooks,
  approveBook,
  rejectBook,
} from "../api/admin.js";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        fetchAdminStats(),
        fetchPendingBooks({ page, limit: 20 }),
      ]);
      setStats(s);
      setPending(p.data || []);
      setPagination(p.pagination || { page: 1, totalPages: 1 });
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    setBusy(true);
    try {
      await approveBook(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Approve failed");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    try {
      await rejectBook(rejectId, reason.trim());
      setRejectId(null);
      setReason("");
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Reject failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h3" sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
        Admin
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {stats && (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          }}
        >
          {[
            ["Total books", stats.totalBooks],
            ["Pending", stats.pendingBooks],
            ["Users", stats.totalUsers],
            ["Reviews", stats.totalReviews],
          ].map(([label, value]) => (
            <Paper key={label} sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
                {value}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <Typography variant="h5" gutterBottom sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
          Pending books
        </Typography>
        {pending.length === 0 ? (
          <Typography color="text.secondary">No pending books.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Submitted by</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pending.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.user?.email}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button component={RouterLink} to={`/books/${book.id}`} size="small">
                        View
                      </Button>
                      <Button
                        size="small"
                        color="success"
                        variant="contained"
                        disabled={busy}
                        onClick={() => handleApprove(book.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        disabled={busy}
                        onClick={() => {
                          setRejectId(book.id);
                          setReason("");
                        }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {pagination.totalPages > 1 && (
          <Stack alignItems="center" sx={{ mt: 2 }}>
            <Pagination count={pagination.totalPages} page={page} onChange={(_, p) => setPage(p)} />
          </Stack>
        )}
      </Paper>

      <Dialog open={Boolean(rejectId)} onClose={() => !busy && setRejectId(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reject book</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection reason"
            fullWidth
            multiline
            minRows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectId(null)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleReject} color="error" variant="contained" disabled={busy || !reason.trim()}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
