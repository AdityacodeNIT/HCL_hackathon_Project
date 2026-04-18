import * as schedulingService from "./scheduling.service.js";

export async function getHospitalAvailability(req, res) {
  const data = await schedulingService.getHospitalAvailability(req.params.hospitalId, req.query);

  res.json({
    success: true,
    data,
  });
}

export async function createSlot(req, res) {
  const data = await schedulingService.createSlot(req.body);

  res.status(201).json({
    success: true,
    data,
  });
}

export async function updateSlot(req, res) {
  const data = await schedulingService.updateSlot(req.params.slotId, req.body);

  res.json({
    success: true,
    data,
  });
}

export async function listSlots(req, res) {
  const data = await schedulingService.listSlots(req.query);

  res.json({
    success: true,
    data,
  });
}

export async function listAdminBookings(req, res) {
  const data = await schedulingService.listAdminBookings(req.query);

  res.json({
    success: true,
    data,
  });
}

export async function createBooking(req, res) {
  const data = await schedulingService.createBooking(req.user.id, req.body);

  res.status(201).json({
    success: true,
    data,
  });
}

export async function listMyBookings(req, res) {
  const data = await schedulingService.listMyBookings(req.user.id);

  res.json({
    success: true,
    data,
  });
}

export async function rescheduleBooking(req, res) {
  const data = await schedulingService.rescheduleBooking(req.user.id, req.params.bookingId, req.body);

  res.json({
    success: true,
    data,
  });
}

export async function cancelBooking(req, res) {
  const data = await schedulingService.cancelBooking(req.user.id, req.params.bookingId);

  res.json({
    success: true,
    data,
  });
}

export async function approveBooking(req, res) {
  const data = await schedulingService.approveBooking(req.user.id, req.params.bookingId);

  res.json({
    success: true,
    data,
  });
}

export async function completeBooking(req, res) {
  const data = await schedulingService.completeBooking(req.user.id, req.params.bookingId);

  res.json({
    success: true,
    data,
  });
}

export async function listHospitalBookings(req, res) {
  const data = await schedulingService.listHospitalBookings(req.params.hospitalId, req.query);

  res.json({
    success: true,
    data,
  });
}

export async function adminCancelBooking(req, res) {
  const data = await schedulingService.adminCancelBooking(req.user.id, req.params.bookingId);

  res.json({
    success: true,
    data,
  });
}
